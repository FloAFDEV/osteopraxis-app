DROP FUNCTION IF EXISTS public.admin_search_patients(text, integer, integer, integer);

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
$function$;