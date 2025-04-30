
-- Fonction pour vérifier les conflits de rendez-vous avec exception pour les annulations
CREATE OR REPLACE FUNCTION public.check_appointment_conflicts()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  appointment_time TIMESTAMP;
  end_time TIMESTAMP;
  conflict_count INTEGER;
  is_cancellation BOOLEAN;
BEGIN
  -- Vérifier si c'est une annulation via l'en-tête spécial X-Cancellation-Override
  -- Cette logique est basée sur l'en-tête HTTP que nous envoyons lors des annulations
  is_cancellation := current_setting('request.headers', true)::json->>'x-cancellation-override' = 'true';
  
  -- Si c'est une annulation OU si le statut est déjà CANCELED, nous autorisons l'opération sans vérification
  IF is_cancellation OR NEW.status = 'CANCELED' THEN
    RETURN NEW;
  END IF;
  
  -- Calculate the appointment time
  appointment_time := NEW.date;
  
  -- Calculate the end time (assuming appointments are 30 minutes)
  end_time := appointment_time + INTERVAL '30 minutes';
  
  -- Check if there are any conflicting appointments
  SELECT COUNT(*) INTO conflict_count
  FROM "Appointment"
  WHERE 
    -- Only check appointments with the same active status
    status NOT IN ('CANCELED', 'NO_SHOW') AND
    -- Don't check the current appointment (for updates)
    id != COALESCE(NEW.id, -1) AND
    -- Check if the time overlaps
    date <= end_time AND 
    (date + INTERVAL '30 minutes') >= appointment_time;
  
  -- If there's a conflict, raise an exception
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Un rendez-vous existe déjà sur ce créneau horaire.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- S'assurer que le trigger est correctement attaché à la table Appointment
DROP TRIGGER IF EXISTS check_appointment_conflicts_trigger ON "Appointment";
CREATE TRIGGER check_appointment_conflicts_trigger
BEFORE INSERT OR UPDATE ON "Appointment"
FOR EACH ROW
EXECUTE FUNCTION check_appointment_conflicts();
