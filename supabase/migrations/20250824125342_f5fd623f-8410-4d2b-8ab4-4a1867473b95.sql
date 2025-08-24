-- Correction des fonctions SQL pour la sécurité (search_path)
-- Mise à jour des fonctions existantes avec SET search_path

-- 1. Fonction is_admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public."User" u
    where u.auth_id = uid and u.role = 'ADMIN'
  );
$function$;

-- 2. Fonction verify_admin_access
CREATE OR REPLACE FUNCTION public.verify_admin_access()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  is_active boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT u.role::text, u.is_active
  INTO user_role, is_active
  FROM public."User" u
  WHERE u.auth_id = auth.uid() OR u.id = auth.uid();
  
  RETURN user_role = 'ADMIN' AND is_active = true;
END;
$function$;

-- 3. Fonction get_current_osteopath_id avec sécurité renforcée
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id_secure()
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    osteopath_id INTEGER;
    user_active BOOLEAN;
BEGIN
    -- Verify user is authenticated and active
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check if user is active
    SELECT u.is_active INTO user_active
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL;
    
    IF user_active IS NOT TRUE THEN
        RETURN NULL;
    END IF;
    
    -- Get osteopath ID with additional validation
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL
    AND u.is_active = true;
    
    -- Double-check osteopath exists and is valid
    IF osteopath_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public."Osteopath" o
            WHERE o.id = osteopath_id
            AND (o."authId" = auth.uid() OR o."userId" = auth.uid())
        ) THEN
            RETURN NULL;
        END IF;
    END IF;
    
    RETURN osteopath_id;
END;
$function$;

-- 4. Fonction de validation des accès patients avec audit
CREATE OR REPLACE FUNCTION public.can_access_patient_secure(patient_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    osteopath_id INTEGER;
    has_access BOOLEAN := FALSE;
BEGIN
    -- Obtenir l'ID ostéopathe courant de manière sécurisée
    osteopath_id := public.get_current_osteopath_id_secure();
    
    IF osteopath_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier l'accès au patient
    SELECT EXISTS (
        SELECT 1 FROM public."Patient" p
        WHERE p.id = patient_id 
        AND p.deleted_at IS NULL
        AND (
            p."osteopathId" = osteopath_id 
            OR p."cabinetId" IN (
                SELECT oc.cabinet_id 
                FROM public.osteopath_cabinet oc 
                WHERE oc.osteopath_id = osteopath_id
            )
        )
    ) INTO has_access;
    
    -- Logger l'accès pour audit si nécessaire
    IF has_access AND patient_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, user_id, new_values
        ) VALUES (
            'Patient', patient_id::text, 'ACCESS_CHECK', auth.uid(),
            jsonb_build_object('osteopath_id', osteopath_id, 'timestamp', NOW())
        );
    END IF;
    
    RETURN has_access;
END;
$function$;

-- 5. Fonction de nettoyage sécurisée
CREATE OR REPLACE FUNCTION public.secure_cleanup_expired_data()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cleaned_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Vérifier les permissions admin
  IF NOT public.verify_admin_access() THEN
    RAISE EXCEPTION 'Accès refusé: droits administrateur requis';
  END IF;
  
  -- Nettoyer les données démo expirées avec logging
  DELETE FROM public."Invoice" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  cleaned_count := cleaned_count + temp_count;

  DELETE FROM public."Appointment" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  cleaned_count := cleaned_count + temp_count;

  DELETE FROM public."Patient" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  cleaned_count := cleaned_count + temp_count;

  -- Logger l'action de nettoyage
  INSERT INTO public.audit_logs (
    table_name, record_id, action, new_values, user_id
  ) VALUES (
    'system_cleanup', 'secure_cleanup', 'SECURE_CLEANUP',
    jsonb_build_object('cleaned_count', cleaned_count, 'timestamp', NOW()),
    auth.uid()
  );

  RETURN cleaned_count;
END;
$function$;