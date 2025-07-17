-- Corriger la fonction admin_get_system_stats pour le type double precision
CREATE OR REPLACE FUNCTION public.admin_get_system_stats()
 RETURNS TABLE(
   total_users integer, 
   active_users integer, 
   total_osteopaths integer, 
   total_cabinets integer, 
   total_patients integer, 
   active_patients integer, 
   total_appointments integer, 
   appointments_this_month integer, 
   total_invoices integer, 
   paid_invoices integer, 
   system_revenue numeric, 
   avg_appointments_per_osteopath numeric, 
   database_size text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder aux statistiques système';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM "User" WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*)::INTEGER FROM "User" WHERE deleted_at IS NULL AND is_active = true) as active_users,
        (SELECT COUNT(*)::INTEGER FROM "Osteopath") as total_osteopaths,
        (SELECT COUNT(*)::INTEGER FROM "Cabinet") as total_cabinets,
        (SELECT COUNT(*)::INTEGER FROM "Patient") as total_patients,
        (SELECT COUNT(*)::INTEGER FROM "Patient" WHERE deleted_at IS NULL) as active_patients,
        (SELECT COUNT(*)::INTEGER FROM "Appointment" WHERE deleted_at IS NULL) as total_appointments,
        (SELECT COUNT(*)::INTEGER FROM "Appointment" 
         WHERE deleted_at IS NULL 
         AND date >= date_trunc('month', NOW())
         AND date < date_trunc('month', NOW()) + INTERVAL '1 month') as appointments_this_month,
        (SELECT COUNT(*)::INTEGER FROM "Invoice" WHERE deleted_at IS NULL) as total_invoices,
        (SELECT COUNT(*)::INTEGER FROM "Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as paid_invoices,
        (SELECT COALESCE(SUM(amount), 0)::NUMERIC FROM "Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as system_revenue,
        (SELECT 
            CASE 
                WHEN COUNT(DISTINCT a."osteopathId") > 0 
                THEN COUNT(a.id)::NUMERIC / COUNT(DISTINCT a."osteopathId")::NUMERIC
                ELSE 0::NUMERIC 
            END
         FROM "Appointment" a WHERE a.deleted_at IS NULL) as avg_appointments_per_osteopath,
        'N/A'::TEXT as database_size
    ;
END;
$function$

-- Corriger la fonction admin_search_patients pour le type timestamp
CREATE OR REPLACE FUNCTION public.admin_search_patients(
  search_term text DEFAULT NULL::text, 
  osteopath_filter integer DEFAULT NULL::integer, 
  cabinet_filter integer DEFAULT NULL::integer, 
  limit_count integer DEFAULT 50
)
 RETURNS TABLE(
   id integer, 
   first_name text, 
   last_name text, 
   email text, 
   phone text, 
   osteopath_id integer, 
   osteopath_name text, 
   cabinet_id integer, 
   cabinet_name text, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone, 
   deleted_at timestamp with time zone
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent effectuer cette recherche';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p."firstName" as first_name,
        p."lastName" as last_name,
        p.email,
        p.phone,
        p."osteopathId" as osteopath_id,
        o.name as osteopath_name,
        p."cabinetId" as cabinet_id,
        c.name as cabinet_name,
        p."createdAt"::timestamp with time zone as created_at,
        p."updatedAt"::timestamp with time zone as updated_at,
        p.deleted_at
    FROM "Patient" p
    LEFT JOIN "Osteopath" o ON p."osteopathId" = o.id
    LEFT JOIN "Cabinet" c ON p."cabinetId" = c.id
    WHERE 
        (search_term IS NULL OR 
         p."firstName" ILIKE '%' || search_term || '%' OR
         p."lastName" ILIKE '%' || search_term || '%' OR
         p.email ILIKE '%' || search_term || '%' OR
         p.phone ILIKE '%' || search_term || '%' OR
         p.id::text = search_term)
    AND (osteopath_filter IS NULL OR p."osteopathId" = osteopath_filter)
    AND (cabinet_filter IS NULL OR p."cabinetId" = cabinet_filter)
    ORDER BY 
        CASE WHEN p.deleted_at IS NOT NULL THEN 1 ELSE 0 END,
        p."updatedAt" DESC
    LIMIT limit_count;
END;
$function$