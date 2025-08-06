-- Correction des fonctions restantes avec search_path

-- Correction pour les fonctions de gestion des abonnements et limites
CREATE OR REPLACE FUNCTION public.get_subscription_limits(user_uuid uuid)
 RETURNS TABLE(max_patients integer, max_cabinets integer, features jsonb, subscription_tier text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  sub_record RECORD;
  plan_record RECORD;
BEGIN
  -- Get user's subscription
  SELECT * INTO sub_record
  FROM public.subscribers
  WHERE user_id = user_uuid;
  
  -- If no subscription or not subscribed, return free plan limits
  IF sub_record IS NULL OR NOT sub_record.subscribed THEN
    SELECT * INTO plan_record
    FROM public.subscription_plans
    WHERE name = 'Gratuit';
    
    RETURN QUERY SELECT 
      plan_record.max_patients,
      plan_record.max_cabinets,
      plan_record.features,
      'Gratuit'::TEXT;
    RETURN;
  END IF;
  
  -- Get plan details based on subscription tier
  SELECT * INTO plan_record
  FROM public.subscription_plans
  WHERE name = sub_record.subscription_tier;
  
  -- If plan not found, default to free
  IF plan_record IS NULL THEN
    SELECT * INTO plan_record
    FROM public.subscription_plans
    WHERE name = 'Gratuit';
  END IF;
  
  RETURN QUERY SELECT 
    plan_record.max_patients,
    plan_record.max_cabinets,
    plan_record.features,
    sub_record.subscription_tier;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_perform_action(user_uuid uuid, action_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  limits RECORD;
  current_count INTEGER;
  max_practitioners_limit INTEGER;
BEGIN
  -- Get subscription limits
  SELECT * INTO limits
  FROM public.get_subscription_limits(user_uuid);
  
  CASE action_type
    WHEN 'create_patient' THEN
      -- Count current patients
      SELECT COUNT(*) INTO current_count
      FROM public."Patient" p
      JOIN public."Osteopath" o ON o.id = p."osteopathId"
      WHERE o."authId" = user_uuid AND p.deleted_at IS NULL;
      
      RETURN current_count < limits.max_patients;
      
    WHEN 'create_cabinet' THEN
      -- Count current cabinets
      SELECT COUNT(*) INTO current_count
      FROM public."Cabinet" c
      JOIN public."Osteopath" o ON o.id = c."osteopathId"
      WHERE o."authId" = user_uuid;
      
      RETURN current_count < limits.max_cabinets;
      
    WHEN 'create_practitioner' THEN
      -- Count current practitioners/osteopaths for this user
      SELECT COUNT(*) INTO current_count
      FROM public."Osteopath" o
      WHERE o."authId" = user_uuid;
      
      -- Get max_practitioners from subscription plan
      SELECT sp.max_practitioners INTO max_practitioners_limit
      FROM public.subscription_plans sp 
      WHERE sp.name = limits.subscription_tier;
      
      -- Check if unlimited or within limits
      RETURN (limits.features->>'unlimited_practitioners')::BOOLEAN = true 
             OR current_count < COALESCE(max_practitioners_limit, 1);
      
    WHEN 'access_invoices' THEN
      RETURN (limits.features->>'invoices')::BOOLEAN;
      
    WHEN 'access_advanced_stats' THEN
      RETURN (limits.features->>'advanced_stats')::BOOLEAN;
      
    WHEN 'export_data' THEN
      RETURN (limits.features->>'export')::BOOLEAN;
      
    ELSE
      RETURN true;
  END CASE;
END;
$function$;

-- Correction pour les fonctions d'administration
CREATE OR REPLACE FUNCTION public.admin_get_system_stats()
 RETURNS TABLE(total_users integer, active_users integer, total_osteopaths integer, total_cabinets integer, total_patients integer, active_patients integer, total_appointments integer, appointments_this_month integer, total_invoices integer, paid_invoices integer, system_revenue numeric, avg_appointments_per_osteopath numeric, database_size text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM public."User" 
        WHERE public."User".id = auth.uid() 
        AND public."User".role = 'ADMIN'
        AND public."User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder aux statistiques système';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public."User" WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*)::INTEGER FROM public."User" WHERE deleted_at IS NULL AND is_active = true) as active_users,
        (SELECT COUNT(*)::INTEGER FROM public."Osteopath") as total_osteopaths,
        (SELECT COUNT(*)::INTEGER FROM public."Cabinet") as total_cabinets,
        (SELECT COUNT(*)::INTEGER FROM public."Patient") as total_patients,
        (SELECT COUNT(*)::INTEGER FROM public."Patient" WHERE deleted_at IS NULL) as active_patients,
        (SELECT COUNT(*)::INTEGER FROM public."Appointment" WHERE deleted_at IS NULL) as total_appointments,
        (SELECT COUNT(*)::INTEGER FROM public."Appointment" 
         WHERE deleted_at IS NULL 
         AND date >= date_trunc('month', NOW())
         AND date < date_trunc('month', NOW()) + INTERVAL '1 month') as appointments_this_month,
        (SELECT COUNT(*)::INTEGER FROM public."Invoice" WHERE deleted_at IS NULL) as total_invoices,
        (SELECT COUNT(*)::INTEGER FROM public."Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as paid_invoices,
        (SELECT COALESCE(SUM(amount), 0)::NUMERIC FROM public."Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as system_revenue,
        (SELECT 
            CASE 
                WHEN COUNT(DISTINCT a."osteopathId") > 0 
                THEN COUNT(a.id)::NUMERIC / COUNT(DISTINCT a."osteopathId")::NUMERIC
                ELSE 0::NUMERIC 
            END
         FROM public."Appointment" a WHERE a.deleted_at IS NULL) as avg_appointments_per_osteopath,
        'N/A'::TEXT as database_size
    ;
END;
$function$;

-- Correction pour les fonctions d'autorisation des ostéopathes
CREATE OR REPLACE FUNCTION public.get_authorized_osteopaths(current_osteopath_auth_id uuid)
 RETURNS TABLE(id integer, name text, professional_title text, rpps_number text, siret text, access_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  -- Soi-même
  SELECT 
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'self'::text as access_type
  FROM public."Osteopath" o
  WHERE o."authId" = current_osteopath_auth_id
  
  UNION
  
  -- Mes remplaçants (ceux qui peuvent me remplacer)
  SELECT 
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'replacement'::text as access_type
  FROM public."Osteopath" o
  JOIN public.osteopath_replacement r ON r.replacement_osteopath_id = o.id
  JOIN public."Osteopath" current_o ON current_o.id = r.osteopath_id
  WHERE current_o."authId" = current_osteopath_auth_id
    AND r.is_active = true
    AND (r.start_date IS NULL OR r.start_date <= CURRENT_DATE)
    AND (r.end_date IS NULL OR r.end_date >= CURRENT_DATE)
  
  UNION
  
  -- Ceux que je peux remplacer
  SELECT 
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'replacement'::text as access_type
  FROM public."Osteopath" o
  JOIN public.osteopath_replacement r ON r.osteopath_id = o.id
  JOIN public."Osteopath" current_o ON current_o.id = r.replacement_osteopath_id
  WHERE current_o."authId" = current_osteopath_auth_id
    AND r.is_active = true
    AND (r.start_date IS NULL OR r.start_date <= CURRENT_DATE)
    AND (r.end_date IS NULL OR r.end_date >= CURRENT_DATE)
  
  UNION
  
  -- Collègues de cabinet (via osteopath_cabinet)
  SELECT DISTINCT
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'cabinet_colleague'::text as access_type
  FROM public."Osteopath" o
  JOIN public.osteopath_cabinet oc1 ON oc1.osteopath_id = o.id
  WHERE oc1.cabinet_id IN (
    SELECT oc2.cabinet_id 
    FROM public.osteopath_cabinet oc2
    JOIN public."Osteopath" current_o ON current_o.id = oc2.osteopath_id
    WHERE current_o."authId" = current_osteopath_auth_id
  )
  AND o."authId" != current_osteopath_auth_id; -- Exclure soi-même
END;
$function$;

-- Correction pour les fonctions de cabinets des ostéopathes
CREATE OR REPLACE FUNCTION public.get_osteopath_cabinets(osteopath_auth_id uuid)
 RETURNS TABLE(cabinet_id integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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
 SET search_path TO ''
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