-- Recréer les autres fonctions admin
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