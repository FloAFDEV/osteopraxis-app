-- Migration corrective : remplacer la vue matérialisée par une fonction pour les analytics
DROP MATERIALIZED VIEW IF EXISTS public.advanced_analytics;

-- Fonction pour récupérer les analytics avancées
CREATE OR REPLACE FUNCTION public.get_advanced_analytics(p_osteopath_id INTEGER DEFAULT NULL)
RETURNS TABLE (
  osteopath_id INTEGER,
  month TIMESTAMP WITH TIME ZONE,
  total_appointments BIGINT,
  completed_appointments BIGINT,
  no_show_appointments BIGINT,
  canceled_appointments BIGINT,
  completion_rate NUMERIC,
  no_show_rate NUMERIC,
  total_revenue NUMERIC,
  total_invoices BIGINT,
  avg_invoice_amount NUMERIC,
  paid_invoices BIGINT,
  paid_revenue NUMERIC,
  new_patients BIGINT,
  new_children BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  auth_osteopath_id INTEGER;
BEGIN
  -- Récupérer l'ID de l'ostéopathe connecté
  SELECT o.id INTO auth_osteopath_id
  FROM "Osteopath" o
  WHERE o."authId" = auth.uid();
  
  -- Si pas d'ostéopathe trouvé, retourner vide
  IF auth_osteopath_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Utiliser l'ostéopathe fourni ou celui connecté
  auth_osteopath_id := COALESCE(p_osteopath_id, auth_osteopath_id);
  
  RETURN QUERY
  WITH appointment_stats AS (
    SELECT 
      a."osteopathId",
      DATE_TRUNC('month', a.date::date) as month,
      COUNT(*) as total_appointments,
      COUNT(*) FILTER (WHERE a.status = 'COMPLETED') as completed_appointments,
      COUNT(*) FILTER (WHERE a.status = 'NO_SHOW') as no_show_appointments,
      COUNT(*) FILTER (WHERE a.status = 'CANCELED') as canceled_appointments,
      AVG(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completion_rate,
      AVG(CASE WHEN a.status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show_rate
    FROM "Appointment" a
    WHERE a.date >= CURRENT_DATE - INTERVAL '2 years'
      AND a."osteopathId" = auth_osteopath_id
    GROUP BY a."osteopathId", DATE_TRUNC('month', a.date::date)
  ),
  revenue_stats AS (
    SELECT 
      i."osteopathId",
      DATE_TRUNC('month', i.date::date) as month,
      SUM(i.amount) as total_revenue,
      COUNT(*) as total_invoices,
      AVG(i.amount) as avg_invoice_amount,
      COUNT(*) FILTER (WHERE i."paymentStatus" = 'PAID') as paid_invoices,
      SUM(CASE WHEN i."paymentStatus" = 'PAID' THEN i.amount ELSE 0 END) as paid_revenue
    FROM "Invoice" i
    WHERE i.date >= CURRENT_DATE - INTERVAL '2 years'
      AND i."osteopathId" = auth_osteopath_id
    GROUP BY i."osteopathId", DATE_TRUNC('month', i.date::date)
  ),
  patient_stats AS (
    SELECT 
      p."osteopathId",
      DATE_TRUNC('month', p."createdAt"::date) as month,
      COUNT(*) as new_patients,
      COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, p."birthDate"::date)) < 18) as new_children
    FROM "Patient" p
    WHERE p."createdAt" >= CURRENT_DATE - INTERVAL '2 years'
      AND p."osteopathId" = auth_osteopath_id
    GROUP BY p."osteopathId", DATE_TRUNC('month', p."createdAt"::date)
  )
  SELECT 
    COALESCE(a."osteopathId", r."osteopathId", p."osteopathId")::INTEGER as osteopath_id,
    COALESCE(a.month, r.month, p.month) as month,
    COALESCE(a.total_appointments, 0) as total_appointments,
    COALESCE(a.completed_appointments, 0) as completed_appointments,
    COALESCE(a.no_show_appointments, 0) as no_show_appointments,
    COALESCE(a.canceled_appointments, 0) as canceled_appointments,
    COALESCE(a.completion_rate, 0) as completion_rate,
    COALESCE(a.no_show_rate, 0) as no_show_rate,
    COALESCE(r.total_revenue, 0) as total_revenue,
    COALESCE(r.total_invoices, 0) as total_invoices,
    COALESCE(r.avg_invoice_amount, 0) as avg_invoice_amount,
    COALESCE(r.paid_invoices, 0) as paid_invoices,
    COALESCE(r.paid_revenue, 0) as paid_revenue,
    COALESCE(p.new_patients, 0) as new_patients,
    COALESCE(p.new_children, 0) as new_children
  FROM appointment_stats a
  FULL OUTER JOIN revenue_stats r ON a."osteopathId" = r."osteopathId" AND a.month = r.month
  FULL OUTER JOIN patient_stats p ON COALESCE(a."osteopathId", r."osteopathId") = p."osteopathId" 
    AND COALESCE(a.month, r.month) = p.month
  ORDER BY month DESC;
END;
$$;

-- Fonction pour générer automatiquement les rendez-vous récurrents
CREATE OR REPLACE FUNCTION public.generate_recurring_appointments(p_recurring_id INTEGER, p_limit INTEGER DEFAULT 10)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  rec_app RECORD;
  current_date DATE;
  appointment_date DATE;
  appointment_datetime TIMESTAMP WITH TIME ZONE;
  counter INTEGER := 0;
  max_iterations INTEGER := 365; -- Sécurité pour éviter les boucles infinies
  iteration_count INTEGER := 0;
BEGIN
  -- Récupérer les détails de la récurrence
  SELECT * INTO rec_app
  FROM recurring_appointments
  WHERE id = p_recurring_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  current_date := rec_app.start_date;
  
  WHILE counter < p_limit AND iteration_count < max_iterations LOOP
    iteration_count := iteration_count + 1;
    
    -- Vérifier si nous avons dépassé la date de fin
    IF rec_app.end_date IS NOT NULL AND current_date > rec_app.end_date THEN
      EXIT;
    END IF;
    
    -- Vérifier si cette date n'est pas dans les exceptions
    IF current_date = ANY(rec_app.exceptions) THEN
      -- Passer au prochain intervalle
      CASE rec_app.recurrence_type
        WHEN 'daily' THEN
          current_date := current_date + (rec_app.recurrence_interval || ' days')::interval;
        WHEN 'weekly' THEN
          current_date := current_date + (rec_app.recurrence_interval * 7 || ' days')::interval;
        WHEN 'biweekly' THEN
          current_date := current_date + (rec_app.recurrence_interval * 14 || ' days')::interval;
        WHEN 'monthly' THEN
          current_date := current_date + (rec_app.recurrence_interval || ' months')::interval;
      END CASE;
      CONTINUE;
    END IF;
    
    -- Pour les récurrences hebdomadaires, vérifier le jour de la semaine
    IF rec_app.recurrence_type IN ('weekly', 'biweekly') AND rec_app.weekdays IS NOT NULL THEN
      IF NOT (EXTRACT(DOW FROM current_date)::INTEGER = ANY(rec_app.weekdays)) THEN
        current_date := current_date + '1 day'::interval;
        CONTINUE;
      END IF;
    END IF;
    
    -- Créer la timestamp complète
    appointment_datetime := current_date + rec_app.start_time;
    
    -- Vérifier qu'il n'existe pas déjà un rendez-vous à cette date/heure
    IF NOT EXISTS (
      SELECT 1 FROM "Appointment" 
      WHERE "osteopathId" = rec_app.osteopath_id 
        AND "patientId" = rec_app.patient_id
        AND date = appointment_datetime
    ) THEN
      -- Créer le rendez-vous
      INSERT INTO "Appointment" (
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
        current_date := current_date + (rec_app.recurrence_interval || ' days')::interval;
      WHEN 'weekly' THEN
        current_date := current_date + (rec_app.recurrence_interval * 7 || ' days')::interval;
      WHEN 'biweekly' THEN
        current_date := current_date + (rec_app.recurrence_interval * 14 || ' days')::interval;
      WHEN 'monthly' THEN
        current_date := current_date + (rec_app.recurrence_interval || ' months')::interval;
    END CASE;
  END LOOP;
  
  RETURN counter;
END;
$$;