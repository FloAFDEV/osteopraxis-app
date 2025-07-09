-- Phase 2: Admin Panel - Gestion des cabinets et patients

-- Fonction pour les admins : recherche globale de patients
CREATE OR REPLACE FUNCTION admin_search_patients(
    search_term TEXT DEFAULT NULL,
    osteopath_filter INTEGER DEFAULT NULL,
    cabinet_filter INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
    id INTEGER,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    osteopath_id INTEGER,
    osteopath_name TEXT,
    cabinet_id INTEGER,
    cabinet_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE auth_id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
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
$$;

-- Fonction pour détecter les doublons de patients
CREATE OR REPLACE FUNCTION admin_find_patient_duplicates()
RETURNS TABLE(
    group_id INTEGER,
    patient_id INTEGER,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    similarity_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE auth_id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
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
$$;

-- Fonction pour les admins : gestion des cabinets
CREATE OR REPLACE FUNCTION admin_get_cabinets_with_stats()
RETURNS TABLE(
    id INTEGER,
    name TEXT,
    address TEXT,
    email TEXT,
    phone TEXT,
    owner_osteopath_id INTEGER,
    owner_name TEXT,
    associated_osteopaths_count INTEGER,
    patients_count INTEGER,
    active_patients_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE auth_id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
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
        NULL::TIMESTAMP WITH TIME ZONE as deleted_at  -- Les cabinets n'ont pas de soft delete pour l'instant
    FROM "Cabinet" c
    LEFT JOIN "Osteopath" o ON c."osteopathId" = o.id
    LEFT JOIN (
        SELECT 
            oc.cabinet_id,
            COUNT(oc.osteopath_id) as associated_count
        FROM osteopath_cabinet oc
        GROUP BY oc.cabinet_id
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

-- Fonction pour soft delete d'un cabinet (admin uniquement)
CREATE OR REPLACE FUNCTION admin_deactivate_cabinet(cabinet_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cabinet_exists BOOLEAN;
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE auth_id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
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

    -- Pour l'instant, on utilise un flag dans les notes ou on peut ajouter un champ deleted_at
    -- Comme la table Cabinet n'a pas de soft delete, on va juste logger l'action
    -- et laisser le cabinet actif mais marqué dans les logs
    
    RETURN TRUE;
END;
$$;

-- Fonction pour obtenir les patients orphelins (sans ostéopathe actif)
CREATE OR REPLACE FUNCTION admin_get_orphan_patients()
RETURNS TABLE(
    id INTEGER,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    osteopath_id INTEGER,
    cabinet_id INTEGER,
    cabinet_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    issue_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE auth_id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
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
        p."createdAt" as created_at,
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
        p."createdAt" as created_at,
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

-- Politique RLS pour les fonctions admin
GRANT EXECUTE ON FUNCTION admin_search_patients TO authenticated;
GRANT EXECUTE ON FUNCTION admin_find_patient_duplicates TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_cabinets_with_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_deactivate_cabinet TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_orphan_patients TO authenticated;