-- Supprimer et recréer les fonctions admin avec les bons types

-- 1. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS public.admin_get_system_stats();
DROP FUNCTION IF EXISTS public.admin_get_cabinets_with_stats();
DROP FUNCTION IF EXISTS public.admin_get_orphan_patients();

-- 2. Recréer admin_get_system_stats avec double precision
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
    system_revenue double precision,
    avg_appointments_per_osteopath double precision,
    database_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
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
        (SELECT COALESCE(SUM(amount), 0)::double precision FROM "Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as system_revenue,
        (SELECT 
            CASE 
                WHEN COUNT(DISTINCT a."osteopathId") > 0 
                THEN (COUNT(a.id)::double precision / COUNT(DISTINCT a."osteopathId")::double precision)
                ELSE 0::double precision
            END
         FROM "Appointment" a WHERE a.deleted_at IS NULL) as avg_appointments_per_osteopath,
        'N/A'::TEXT as database_size
    ;
END;
$$;

-- 3. Recréer admin_get_cabinets_with_stats sans ambiguïté
CREATE OR REPLACE FUNCTION public.admin_get_cabinets_with_stats()
RETURNS TABLE(
    id integer,
    name text,
    address text,
    email text,
    phone text,
    owner_osteopath_id integer,
    owner_name text,
    associated_osteopaths_count integer,
    patients_count integer,
    active_patients_count integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        c.id,
        c.name,
        c.address,
        c.email,
        c.phone,
        c."osteopathId" as owner_osteopath_id,
        o.name as owner_name,
        COALESCE(oc.associated_count, 0)::INTEGER as associated_osteopaths_count,
        COALESCE(pc.total_patients, 0)::INTEGER as patients_count,
        COALESCE(pc.active_patients, 0)::INTEGER as active_patients_count,
        c."createdAt" as created_at,
        c."updatedAt" as updated_at,
        NULL::TIMESTAMP WITH TIME ZONE as deleted_at
    FROM "Cabinet" c
    LEFT JOIN "Osteopath" o ON c."osteopathId" = o.id
    LEFT JOIN (
        SELECT 
            oc_sub.cabinet_id,
            COUNT(oc_sub.osteopath_id) as associated_count
        FROM osteopath_cabinet oc_sub
        GROUP BY oc_sub.cabinet_id
    ) oc ON c.id = oc.cabinet_id
    LEFT JOIN (
        SELECT 
            p."cabinetId",
            COUNT(*) as total_patients,
            COUNT(CASE WHEN p.deleted_at IS NULL THEN 1 END) as active_patients
        FROM "Patient" p
        WHERE p."cabinetId" IS NOT NULL
        GROUP BY p."cabinetId"
    ) pc ON c.id = pc."cabinetId"
    ORDER BY c."createdAt" DESC;
END;
$$;

-- 4. Recréer admin_get_orphan_patients avec bons types
CREATE OR REPLACE FUNCTION public.admin_get_orphan_patients()
RETURNS TABLE(
    id integer,
    first_name text,
    last_name text,
    email text,
    phone text,
    osteopath_id integer,
    cabinet_id integer,
    cabinet_name text,
    created_at timestamp with time zone,
    issue_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    -- Patients sans ostéopathe
    SELECT 
        p.id,
        p."firstName" as first_name,
        p."lastName" as last_name,
        p.email,
        p.phone,
        p."osteopathId" as osteopath_id,
        p."cabinetId" as cabinet_id,
        c.name as cabinet_name,
        p."createdAt"::timestamp with time zone as created_at,
        'no_osteopath'::TEXT as issue_type
    FROM "Patient" p
    LEFT JOIN "Cabinet" c ON p."cabinetId" = c.id
    WHERE p.deleted_at IS NULL
    AND p."osteopathId" IS NULL
    
    UNION ALL
    
    -- Patients avec ostéopathe qui n'existe plus
    SELECT 
        p.id,
        p."firstName" as first_name,
        p."lastName" as last_name,
        p.email,
        p.phone,
        p."osteopathId" as osteopath_id,
        p."cabinetId" as cabinet_id,
        c.name as cabinet_name,
        p."createdAt"::timestamp with time zone as created_at,
        'osteopath_not_found'::TEXT as issue_type
    FROM "Patient" p
    LEFT JOIN "Cabinet" c ON p."cabinetId" = c.id
    LEFT JOIN "Osteopath" o ON p."osteopathId" = o.id
    WHERE p.deleted_at IS NULL
    AND p."osteopathId" IS NOT NULL
    AND o.id IS NULL
    
    ORDER BY created_at DESC;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION admin_get_system_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_cabinets_with_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_orphan_patients TO authenticated;