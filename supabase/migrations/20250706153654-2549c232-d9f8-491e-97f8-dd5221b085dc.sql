-- Migration corrective : fonction pour générer les rendez-vous récurrents (noms de variables corrigés)
CREATE OR REPLACE FUNCTION public.generate_recurring_appointments(p_recurring_id INTEGER, p_limit INTEGER DEFAULT 10)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
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
  FROM recurring_appointments
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
$$;