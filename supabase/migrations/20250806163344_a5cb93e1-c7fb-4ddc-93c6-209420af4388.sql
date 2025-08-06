-- Correction des avertissements de sécurité search_path pour toutes les fonctions

-- Correction pour les fonctions de gestion des invitations de cabinet
CREATE OR REPLACE FUNCTION public.use_cabinet_invitation(p_invitation_code text, p_osteopath_id integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- Correction pour les fonctions de gestion des remplacements
CREATE OR REPLACE FUNCTION public.update_replacement_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Correction pour les fonctions de synchronisation de cabinet
CREATE OR REPLACE FUNCTION public.update_cabinet_sync_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_syncs()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les syncs expirés
  DELETE FROM public.cabinet_patient_sync 
  WHERE expires_at < NOW() OR (NOT is_active AND updated_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Logger l'action de nettoyage
  INSERT INTO public.cabinet_sync_logs (
    sync_id, action, performed_by_osteopath_id, metadata
  ) 
  SELECT 
    gen_random_uuid(), 
    'expired', 
    -1, -- System user
    jsonb_build_object('deleted_count', deleted_count)
  WHERE deleted_count > 0;
  
  RETURN deleted_count;
END;
$function$;

-- Correction pour les fonctions de calendrier Google
CREATE OR REPLACE FUNCTION public.update_google_calendar_tokens_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_google_calendar_events()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.google_calendar_events 
  WHERE end_time < NOW() - INTERVAL '3 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.are_google_tokens_expired(p_osteopath_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  token_expires_at TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO token_expires_at
  FROM public.google_calendar_tokens
  WHERE osteopath_id = p_osteopath_id;
  
  -- Return true if no tokens found or if tokens expire within 5 minutes
  RETURN (token_expires_at IS NULL OR token_expires_at <= NOW() + INTERVAL '5 minutes');
END;
$function$;

-- Correction pour les fonctions de gestion des relations patients
CREATE OR REPLACE FUNCTION public.update_patient_relationships_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Correction pour les fonctions d'audit
CREATE OR REPLACE FUNCTION public.log_audit_action(p_action text, p_table_name text, p_record_id text, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_record(p_table_name text, p_record_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  sql_query TEXT;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;

  -- Construire la requête de soft delete
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NOW(), deleted_by = auth.uid() WHERE id = %L AND deleted_at IS NULL',
    p_table_name,
    p_record_id
  );
  
  -- Exécuter la requête
  EXECUTE sql_query;
  
  -- Logger l'action
  PERFORM public.log_audit_action('SOFT_DELETE', p_table_name, p_record_id);
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_record(p_table_name text, p_record_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  sql_query TEXT;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;

  -- Construire la requête de restauration
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = %L',
    p_table_name,
    p_record_id
  );
  
  -- Exécuter la requête
  EXECUTE sql_query;
  
  -- Logger l'action
  PERFORM public.log_audit_action('RESTORE', p_table_name, p_record_id);
  
  RETURN TRUE;
END;
$function$;