-- Supprimer et recréer la fonction admin_get_cabinets_with_stats avec les bons types
DROP FUNCTION IF EXISTS public.admin_get_cabinets_with_stats();

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
    created_at timestamp without time zone, 
    updated_at timestamp without time zone, 
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
$function$;