-- Corriger les fonctions admin pour utiliser le bon champ d'authentification
-- Fonction admin_get_system_stats corrigée
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
        (SELECT COALESCE(SUM(amount), 0) FROM "Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as system_revenue,
        (SELECT 
            CASE 
                WHEN COUNT(DISTINCT a."osteopathId") > 0 
                THEN COUNT(a.id)::NUMERIC / COUNT(DISTINCT a."osteopathId")::NUMERIC
                ELSE 0 
            END
         FROM "Appointment" a WHERE a.deleted_at IS NULL) as avg_appointments_per_osteopath,
        'N/A'::TEXT as database_size
    ;
END;
$function$;

-- Fonction admin_search_patients corrigée  
CREATE OR REPLACE FUNCTION public.admin_search_patients(search_term text DEFAULT NULL::text, osteopath_filter integer DEFAULT NULL::integer, cabinet_filter integer DEFAULT NULL::integer, limit_count integer DEFAULT 50)
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
        p."createdAt" as created_at,
        p."updatedAt" as updated_at,
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
$function$;

-- Fonction admin_find_patient_duplicates corrigée
CREATE OR REPLACE FUNCTION public.admin_find_patient_duplicates()
 RETURNS TABLE(
    group_id integer, 
    patient_id integer, 
    first_name text, 
    last_name text, 
    email text, 
    phone text, 
    birth_date date, 
    similarity_score double precision
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
    WITH potential_duplicates AS (
        SELECT 
            p1.id as patient_id,
            p1."firstName" as first_name,
            p1."lastName" as last_name,
            p1.email,
            p1.phone,
            p1."birthDate"::date as birth_date,
            ROW_NUMBER() OVER (
                PARTITION BY 
                    LOWER(TRIM(p1."firstName")),
                    LOWER(TRIM(p1."lastName")),
                    p1."birthDate"
                ORDER BY p1."createdAt"
            ) as group_id,
            1.0 as similarity_score
        FROM "Patient" p1
        WHERE p1.deleted_at IS NULL
        AND p1."firstName" IS NOT NULL 
        AND p1."lastName" IS NOT NULL
        AND p1."birthDate" IS NOT NULL
    )
    SELECT 
        pd.group_id::INTEGER,
        pd.patient_id::INTEGER,
        pd.first_name::TEXT,
        pd.last_name::TEXT,
        pd.email::TEXT,
        pd.phone::TEXT,
        pd.birth_date::DATE,
        pd.similarity_score::FLOAT
    FROM potential_duplicates pd
    WHERE pd.group_id > 1
    ORDER BY pd.first_name, pd.last_name, pd.birth_date;
END;
$function$;

-- Fonction admin_deactivate_cabinet corrigée
CREATE OR REPLACE FUNCTION public.admin_deactivate_cabinet(cabinet_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    cabinet_exists BOOLEAN;
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent désactiver un cabinet';
    END IF;

    -- Vérifier que le cabinet existe
    SELECT EXISTS(
        SELECT 1 FROM "Cabinet" 
        WHERE id = cabinet_id
    ) INTO cabinet_exists;

    IF NOT cabinet_exists THEN
        RAISE EXCEPTION 'Cabinet introuvable';
    END IF;

    -- Log de l'action
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id
    ) VALUES (
        'Cabinet',
        cabinet_id::text,
        'admin_deactivate',
        jsonb_build_object('status', 'active'),
        jsonb_build_object('status', 'deactivated', 'deactivated_by', 'admin'),
        auth.uid()
    );

    RETURN TRUE;
END;
$function$;

-- Fonction admin_cleanup_old_logs corrigée
CREATE OR REPLACE FUNCTION public.admin_cleanup_old_logs(retention_days integer DEFAULT 30)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent effectuer cette action';
    END IF;

    -- Supprimer les logs anciens
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Logger l'action de nettoyage
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        new_values,
        user_id
    ) VALUES (
        'audit_logs',
        'cleanup',
        'ADMIN_CLEANUP',
        jsonb_build_object(
            'deleted_count', deleted_count,
            'retention_days', retention_days
        ),
        auth.uid()
    );
    
    RETURN deleted_count;
END;
$function$;