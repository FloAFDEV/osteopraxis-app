-- Vérifier et corriger la fonction get_current_osteopath_id pour le debugging
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id_debug()
RETURNS TABLE(auth_uid uuid, osteopath_id integer, error_message text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    current_auth_uid UUID;
    current_osteopath_id INTEGER;
    error_msg TEXT := 'No error';
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    current_auth_uid := auth.uid();
    
    IF current_auth_uid IS NULL THEN
        RETURN QUERY SELECT NULL::uuid, NULL::integer, 'User not authenticated'::text;
        RETURN;
    END IF;
    
    -- Première tentative via la table User avec auth_id
    SELECT u."osteopathId" INTO current_osteopath_id
    FROM public."User" u
    WHERE u.auth_id = current_auth_uid 
    AND u.deleted_at IS NULL;
    
    IF current_osteopath_id IS NOT NULL THEN
        error_msg := 'Found via User.auth_id';
    ELSE
        -- Essayer avec User.id
        SELECT u."osteopathId" INTO current_osteopath_id
        FROM public."User" u
        WHERE u.id = current_auth_uid 
        AND u.deleted_at IS NULL;
        
        IF current_osteopath_id IS NOT NULL THEN
            error_msg := 'Found via User.id';
        ELSE
            -- Essayer directement dans Osteopath avec authId
            SELECT o.id INTO current_osteopath_id
            FROM public."Osteopath" o
            WHERE o."authId" = current_auth_uid;
            
            IF current_osteopath_id IS NOT NULL THEN
                error_msg := 'Found via Osteopath.authId';
            ELSE
                -- Essayer directement dans Osteopath avec userId
                SELECT o.id INTO current_osteopath_id
                FROM public."Osteopath" o
                WHERE o."userId" = current_auth_uid;
                
                IF current_osteopath_id IS NOT NULL THEN
                    error_msg := 'Found via Osteopath.userId';
                ELSE
                    error_msg := 'No osteopath profile found';
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN QUERY SELECT current_auth_uid, current_osteopath_id, error_msg;
END;
$$;