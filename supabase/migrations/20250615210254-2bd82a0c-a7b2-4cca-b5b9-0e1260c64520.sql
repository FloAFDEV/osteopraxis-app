
-- Mise à jour : le trigger permet la clôture d’un RDV (statut "COMPLETED") même si le créneau se superpose à un autre,
-- car en réel l’ostéopathe clôture à l’arrivée du patient, et la durée réelle prévaut.

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
  -- Vérifier si c'est une annulation
  is_cancellation := current_setting('request.headers', true)::json->>'x-cancellation-override' = 'true';

  -- Si c'est une annulation OU si le statut est déjà CANCELED, alors autoriser
  IF is_cancellation OR NEW.status = 'CANCELED' THEN
    RETURN NEW;
  END IF;

  -- Si la séance est clôturée ("COMPLETED"), autoriser la modification sans vérifier les conflits (enregistrement du réel)
  IF NEW.status = 'COMPLETED' THEN
    RETURN NEW;
  END IF;

  -- Pour les autres statuts, détecter le conflit horaire via la fenêtre prévue
  appointment_time := NEW.date;
  end_time := appointment_time + INTERVAL '1 hour';

  SELECT COUNT(*) INTO conflict_count
  FROM "Appointment"
  WHERE
    status NOT IN ('CANCELED', 'NO_SHOW')
    AND "osteopathId" = NEW."osteopathId"
    AND id != COALESCE(NEW.id, -1)
    AND date < end_time
    AND (date + INTERVAL '1 hour') > appointment_time;

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Un rendez-vous existe déjà sur ce créneau horaire pour cet ostéopathe.';
  END IF;

  RETURN NEW;
END;
$function$;

-- Replace le trigger (si jamais il était avec INTERVAL '30 minutes')
DROP TRIGGER IF EXISTS check_appointment_conflicts_trigger ON "Appointment";
CREATE TRIGGER check_appointment_conflicts_trigger
BEFORE INSERT OR UPDATE ON "Appointment"
FOR EACH ROW
EXECUTE FUNCTION check_appointment_conflicts();
