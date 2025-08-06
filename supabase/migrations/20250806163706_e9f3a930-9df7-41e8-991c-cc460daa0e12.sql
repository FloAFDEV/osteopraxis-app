-- Finalisation de la sécurité - correction des dernières fonctions et ajout du monitoring

-- Correction des fonctions restantes
CREATE OR REPLACE FUNCTION public.generate_recurring_appointments(p_recurring_id integer, p_limit integer DEFAULT 10)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rec_app RECORD;
  processing_date DATE;
  appointment_datetime TIMESTAMP WITH TIME ZONE;
  counter INTEGER := 0;
  max_iterations INTEGER := 365;
  iteration_count INTEGER := 0;
BEGIN
  -- Récupérer les détails de la récurrence
  SELECT * INTO rec_app
  FROM public.recurring_appointments
  WHERE id = p_recurring_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  processing_date := rec_app.start_date;
  
  WHILE counter < p_limit AND iteration_count < max_iterations LOOP
    iteration_count := iteration_count + 1;
    
    -- Vérifier si nous avons dépassé la date de fin
    IF rec_app.end_date IS NOT NULL AND processing_date > rec_app.end_date THEN
      EXIT;
    END IF;
    
    -- Vérifier si cette date n'est pas dans les exceptions
    IF processing_date = ANY(rec_app.exceptions) THEN
      -- Passer au prochain intervalle
      CASE rec_app.recurrence_type
        WHEN 'daily' THEN
          processing_date := processing_date + (rec_app.recurrence_interval || ' days')::interval;
        WHEN 'weekly' THEN
          processing_date := processing_date + (rec_app.recurrence_interval * 7 || ' days')::interval;
        WHEN 'biweekly' THEN
          processing_date := processing_date + (rec_app.recurrence_interval * 14 || ' days')::interval;
        WHEN 'monthly' THEN
          processing_date := processing_date + (rec_app.recurrence_interval || ' months')::interval;
      END CASE;
      CONTINUE;
    END IF;
    
    -- Pour les récurrences hebdomadaires, vérifier le jour de la semaine
    IF rec_app.recurrence_type IN ('weekly', 'biweekly') AND rec_app.weekdays IS NOT NULL THEN
      IF NOT (EXTRACT(DOW FROM processing_date)::INTEGER = ANY(rec_app.weekdays)) THEN
        processing_date := processing_date + '1 day'::interval;
        CONTINUE;
      END IF;
    END IF;
    
    -- Créer la timestamp complète
    appointment_datetime := processing_date + rec_app.start_time;
    
    -- Vérifier qu'il n'existe pas déjà un rendez-vous à cette date/heure
    IF NOT EXISTS (
      SELECT 1 FROM public."Appointment" 
      WHERE "osteopathId" = rec_app.osteopath_id 
        AND "patientId" = rec_app.patient_id
        AND date = appointment_datetime
    ) THEN
      -- Créer le rendez-vous
      INSERT INTO public."Appointment" (
        "patientId",
        "osteopathId",
        "cabinetId",
        date,
        reason,
        notes,
        status,
        "notificationSent",
        recurring_appointment_id,
        "createdAt",
        "updatedAt"
      ) VALUES (
        rec_app.patient_id,
        rec_app.osteopath_id,
        rec_app.cabinet_id,
        appointment_datetime,
        rec_app.reason,
        rec_app.notes,
        'SCHEDULED',
        false,
        rec_app.id,
        now(),
        now()
      );
      
      counter := counter + 1;
    END IF;
    
    -- Passer au prochain intervalle
    CASE rec_app.recurrence_type
      WHEN 'daily' THEN
        processing_date := processing_date + (rec_app.recurrence_interval || ' days')::interval;
      WHEN 'weekly' THEN
        processing_date := processing_date + (rec_app.recurrence_interval * 7 || ' days')::interval;
      WHEN 'biweekly' THEN
        processing_date := processing_date + (rec_app.recurrence_interval * 14 || ' days')::interval;
      WHEN 'monthly' THEN
        processing_date := processing_date + (rec_app.recurrence_interval || ' months')::interval;
    END CASE;
  END LOOP;
  
  RETURN counter;
END;
$function$;

-- Fonction de monitoring de sécurité avancée
CREATE OR REPLACE FUNCTION public.security_health_check()
 RETURNS TABLE(metric_name text, status text, details text, critical boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  -- Vérifier les connexions suspectes
  SELECT 
    'Connexions suspectes'::text,
    CASE WHEN failed_count > 10 THEN 'WARNING'::text ELSE 'OK'::text END,
    'Tentatives de connexion échouées: ' || failed_count::text,
    failed_count > 50
  FROM (
    SELECT COUNT(*) as failed_count 
    FROM public.audit_logs 
    WHERE action LIKE '%FAILED%' 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) s
  
  UNION ALL
  
  -- Vérifier l'activité administrative récente
  SELECT 
    'Activité admin récente'::text,
    CASE WHEN admin_actions > 0 THEN 'INFO'::text ELSE 'OK'::text END,
    'Actions admin dans les 24h: ' || admin_actions::text,
    false
  FROM (
    SELECT COUNT(*) as admin_actions 
    FROM public.audit_logs 
    WHERE action LIKE '%ADMIN%' 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) a
  
  UNION ALL
  
  -- Vérifier les modifications de données sensibles
  SELECT 
    'Modifications sensibles'::text,
    CASE WHEN sensitive_changes > 20 THEN 'WARNING'::text ELSE 'OK'::text END,
    'Modifications de données sensibles: ' || sensitive_changes::text,
    sensitive_changes > 100
  FROM (
    SELECT COUNT(*) as sensitive_changes 
    FROM public.audit_logs 
    WHERE table_name IN ('Patient', 'Osteopath', 'Invoice') 
    AND action IN ('UPDATE', 'DELETE')
    AND created_at > NOW() - INTERVAL '1 hour'
  ) sc;
END;
$function$;

-- Fonction d'optimisation automatique
CREATE OR REPLACE FUNCTION public.auto_optimize_system()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  optimizations_done INTEGER := 0;
BEGIN
  -- Nettoyage automatique des syncs expirés
  SELECT public.cleanup_expired_syncs() INTO optimizations_done;
  
  -- Nettoyage des événements de calendrier anciens
  optimizations_done := optimizations_done + public.cleanup_old_google_calendar_events();
  
  -- Log de l'optimisation
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    user_id
  ) VALUES (
    'system',
    'auto_optimization',
    'AUTO_OPTIMIZE',
    jsonb_build_object('optimizations_count', optimizations_done),
    NULL
  );
  
  RETURN optimizations_done;
END;
$function$;

-- Création d'une table pour le monitoring en temps réel
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_time ON public.system_metrics(metric_name, recorded_at DESC);

-- Politique RLS pour les métriques système
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system metrics" ON public.system_metrics
FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert metrics" ON public.system_metrics
FOR INSERT WITH CHECK (true);

-- Fonction pour enregistrer les métriques
CREATE OR REPLACE FUNCTION public.record_metric(p_name text, p_value numeric, p_unit text DEFAULT '', p_metadata jsonb DEFAULT '{}')
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata)
  VALUES (p_name, p_value, p_unit, p_metadata);
  
  -- Nettoyer les anciennes métriques (garder seulement 30 jours)
  DELETE FROM public.system_metrics 
  WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$function$;