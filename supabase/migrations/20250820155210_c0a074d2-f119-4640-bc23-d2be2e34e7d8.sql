-- Nettoyer les données avant d'appliquer les contraintes de sécurité

-- 1. Nettoyer les numéros de téléphone vides pour éviter l'erreur de contrainte
UPDATE public."Patient" 
SET phone = NULL 
WHERE phone IS NOT NULL AND (phone = '' OR trim(phone) = '');

-- 2. Corriger les fonctions avec search_path pour la sécurité (sans contraintes problématiques pour l'instant)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid()
    AND role = 'ADMIN'
    AND deleted_at IS NULL
  );
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

-- 3. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_auth_id ON public."User"(auth_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_osteopath_id ON public."Patient"("osteopathId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_osteopath_id ON public."Appointment"("osteopathId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_date ON public."Appointment"(date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_payment_status ON public."Invoice"("paymentStatus") WHERE deleted_at IS NULL;

-- 4. Fonction de nettoyage automatique renforcée
CREATE OR REPLACE FUNCTION public.enhanced_cleanup_system()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleaned_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Nettoyer les données démo expirées
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

  -- Nettoyer les utilisateurs démo temporaires (plus de 30 minutes)
  DELETE FROM public."User" 
  WHERE email LIKE 'demo-%@patienthub.fr' 
  AND created_at < (NOW() - INTERVAL '30 minutes');
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  cleaned_count := cleaned_count + temp_count;

  -- Nettoyer les anciens logs d'audit (plus de 90 jours)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  cleaned_count := cleaned_count + temp_count;

  -- Nettoyer les limitations de taux (plus de 24h)
  DELETE FROM public.api_rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  cleaned_count := cleaned_count + temp_count;

  -- Logger le nettoyage
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values
  ) VALUES (
    'system_cleanup',
    'enhanced_cleanup',
    'ENHANCED_CLEANUP',
    jsonb_build_object(
      'cleaned_count', cleaned_count,
      'timestamp', NOW()
    )
  );

  RETURN cleaned_count;
END;
$function$;

-- 5. Corriger toutes les fonctions avec search_path manquant
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