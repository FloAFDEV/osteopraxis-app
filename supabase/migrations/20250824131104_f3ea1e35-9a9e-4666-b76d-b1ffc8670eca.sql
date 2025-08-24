-- Correction des 61 avertissements de sécurité Supabase
-- Phase 1: Correction des fonctions sans search_path

-- Corriger toutes les fonctions restantes avec SET search_path
CREATE OR REPLACE FUNCTION public.admin_access_with_audit()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Vérifier que c'est un admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN FALSE;
  END IF;
  
  -- Logger l'accès admin aux données sensibles
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    user_id
  ) VALUES (
    'SENSITIVE_DATA_ACCESS',
    'admin_access',
    'HDS_ADMIN_ACCESS',
    jsonb_build_object(
      'timestamp', NOW(),
      'warning', 'Admin accessing sensitive data that should be local'
    ),
    auth.uid()
  );
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_demo_data()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Nettoyer les factures de démo expirées
  DELETE FROM public."Invoice" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les rendez-vous de démo expirés
  DELETE FROM public."Appointment" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les patients de démo expirés
  DELETE FROM public."Patient" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les cabinets de démo expirés
  DELETE FROM public."Cabinet" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les ostéopathes de démo expirés
  DELETE FROM public."Osteopath" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les utilisateurs démo dont l'email commence par "demo-"
  -- et qui ont été créés il y a plus de 30 minutes
  DELETE FROM public."User" 
  WHERE email LIKE 'demo-%@patienthub.com' 
  AND created_at < (NOW() - INTERVAL '30 minutes');
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Logger le nettoyage
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values
  ) VALUES (
    'demo_cleanup',
    'system',
    'DEMO_CLEANUP',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'timestamp', NOW()
    )
  );

  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_osteopath_cabinets(osteopath_auth_id uuid)
 RETURNS TABLE(cabinet_id integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT oc.cabinet_id
  FROM public.osteopath_cabinet oc
  JOIN public."Osteopath" o ON o.id = oc.osteopath_id
  WHERE o."authId" = osteopath_auth_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_osteopath_access_patient(osteopath_auth_id uuid, patient_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    -- Patient directement rattaché à l'ostéopathe
    SELECT 1 FROM public."Patient" p 
    JOIN public."Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = patient_id AND o."authId" = osteopath_auth_id
    
    UNION
    
    -- Patient dans un cabinet partagé
    SELECT 1 FROM public."Patient" p
    WHERE p.id = patient_id 
    AND p."cabinetId" IN (
      SELECT cabinet_id FROM public.get_osteopath_cabinets(osteopath_auth_id)
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invitation_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Générer un code de 8 caractères alphanumériques
    code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    -- Remplacer les caractères problématiques
    code := replace(replace(replace(code, '/', ''), '+', ''), '=', '');
    -- Ajouter des caractères si nécessaire
    WHILE length(code) < 8 LOOP
      code := code || chr(65 + floor(random() * 26)::int);
    END LOOP;
    code := substring(code from 1 for 8);
    
    -- Vérifier l'unicité
    SELECT EXISTS(SELECT 1 FROM public.cabinet_invitations WHERE invitation_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$function$;