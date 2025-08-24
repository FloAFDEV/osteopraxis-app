-- Phase 2: Correction des fonctions restantes sans search_path
-- Continuons avec les fonctions manquantes

CREATE OR REPLACE FUNCTION public.admin_search_patients(search_term text DEFAULT NULL::text, osteopath_filter integer DEFAULT NULL::integer, cabinet_filter integer DEFAULT NULL::integer, limit_count integer DEFAULT 50)
 RETURNS TABLE(id integer, first_name text, last_name text, email text, phone text, osteopath_id integer, osteopath_name text, cabinet_id integer, cabinet_name text, created_at timestamp with time zone, updated_at timestamp with time zone, deleted_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM public."User" 
        WHERE public."User".id = auth.uid() 
        AND public."User".role = 'ADMIN'
        AND public."User".deleted_at IS NULL
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
    FROM public."Patient" p
    LEFT JOIN public."Osteopath" o ON p."osteopathId" = o.id
    LEFT JOIN public."Cabinet" c ON p."cabinetId" = c.id
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

CREATE OR REPLACE FUNCTION public.update_replacement_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_osteopath_id()
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    osteopath_id INTEGER;
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Première tentative via la table User avec auth_id ou id
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL;
    
    -- Si pas trouvé, essayer directement dans Osteopath
    IF osteopath_id IS NULL THEN
        SELECT o.id INTO osteopath_id
        FROM public."Osteopath" o
        WHERE o."authId" = auth.uid() OR o."userId" = auth.uid();
    END IF;
    
    RETURN osteopath_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_osteopath_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    osteopath_id INTEGER;
BEGIN
    -- Vérifier si l'ostéopathe existe déjà
    SELECT id INTO osteopath_id
    FROM public."Osteopath"
    WHERE "authId" = NEW.id OR "userId" = NEW.id;
    
    -- Si pas d'ostéopathe, en créer un
    IF osteopath_id IS NULL THEN
        INSERT INTO public."Osteopath" (
            name,
            "authId",
            "userId",
            professional_title,
            ape_code,
            "createdAt",
            "updatedAt"
        ) VALUES (
            COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email),
            NEW.id,
            NEW.id,
            'Ostéopathe D.O.',
            '8690F',
            NOW(),
            NOW()
        ) RETURNING id INTO osteopath_id;
        
        -- Mettre à jour la référence dans User
        UPDATE public."User" 
        SET "osteopathId" = osteopath_id 
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.use_cabinet_invitation(p_invitation_code text, p_osteopath_id integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Vérifier et récupérer l'invitation
  SELECT * INTO invitation_record
  FROM public.cabinet_invitations
  WHERE invitation_code = p_invitation_code
    AND used_at IS NULL
    AND expires_at > NOW();
  
  -- Si invitation non trouvée ou expirée
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Code d''invitation invalide ou expiré');
  END IF;
  
  -- Vérifier si l'ostéopathe n'est pas déjà associé
  IF EXISTS(
    SELECT 1 FROM public.osteopath_cabinet 
    WHERE osteopath_id = p_osteopath_id 
    AND cabinet_id = invitation_record.cabinet_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Déjà associé à ce cabinet');
  END IF;
  
  -- Marquer l'invitation comme utilisée
  UPDATE public.cabinet_invitations
  SET used_at = NOW(), used_by_osteopath_id = p_osteopath_id
  WHERE id = invitation_record.id;
  
  -- Créer l'association
  INSERT INTO public.osteopath_cabinet (osteopath_id, cabinet_id)
  VALUES (p_osteopath_id, invitation_record.cabinet_id);
  
  RETURN json_build_object(
    'success', true, 
    'cabinet_id', invitation_record.cabinet_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Erreur lors de l''association');
END;
$function$;