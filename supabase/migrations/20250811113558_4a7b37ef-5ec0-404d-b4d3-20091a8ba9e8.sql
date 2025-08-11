-- Secure RLS for Patient + Audit triggers across sensitive tables (v2)

-- 1) Patient RLS
ALTER TABLE public."Patient" ENABLE ROW LEVEL SECURITY;

-- Remove any global blocking policy on Patient that prevents normal access
DROP POLICY IF EXISTS "HDS_BLOCK_ALL_PATIENT_ACCESS" ON public."Patient";

-- Drop then recreate osteopath policies for Patient
DROP POLICY IF EXISTS "osteopath_read_patients" ON public."Patient";
CREATE POLICY "osteopath_read_patients"
ON public."Patient"
FOR SELECT
USING (
  ("osteopathId" = public.get_current_osteopath_id())
  OR (
    "cabinetId" IN (
      SELECT oc.cabinet_id FROM public.osteopath_cabinet oc
      WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
  )
);

DROP POLICY IF EXISTS "osteopath_insert_patients" ON public."Patient";
CREATE POLICY "osteopath_insert_patients"
ON public."Patient"
FOR INSERT
WITH CHECK (
  "osteopathId" = public.get_current_osteopath_id()
);

DROP POLICY IF EXISTS "osteopath_update_patients" ON public."Patient";
CREATE POLICY "osteopath_update_patients"
ON public."Patient"
FOR UPDATE
USING (
  ("osteopathId" = public.get_current_osteopath_id())
  OR (
    "cabinetId" IN (
      SELECT oc.cabinet_id FROM public.osteopath_cabinet oc
      WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
  )
)
WITH CHECK (
  "osteopathId" = public.get_current_osteopath_id()
);

DROP POLICY IF EXISTS "osteopath_delete_patients" ON public."Patient";
CREATE POLICY "osteopath_delete_patients"
ON public."Patient"
FOR DELETE
USING (
  "osteopathId" = public.get_current_osteopath_id()
);

-- 2) Audit triggers on sensitive tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_patient_changes') THEN
    CREATE TRIGGER audit_patient_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Patient"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_appointment_changes') THEN
    CREATE TRIGGER audit_appointment_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Appointment"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_invoice_changes') THEN
    CREATE TRIGGER audit_invoice_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Invoice"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_consultation_changes') THEN
    CREATE TRIGGER audit_consultation_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Consultation"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_medical_document_changes') THEN
    CREATE TRIGGER audit_medical_document_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."MedicalDocument"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_treatment_history_changes') THEN
    CREATE TRIGGER audit_treatment_history_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."TreatmentHistory"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_quote_changes') THEN
    CREATE TRIGGER audit_quote_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Quote"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_quote_item_changes') THEN
    CREATE TRIGGER audit_quote_item_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."QuoteItem"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_cabinet_changes') THEN
    CREATE TRIGGER audit_cabinet_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Cabinet"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_osteopath_changes') THEN
    CREATE TRIGGER audit_osteopath_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."Osteopath"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_user_changes') THEN
    CREATE TRIGGER audit_user_changes
    AFTER INSERT OR UPDATE OR DELETE ON public."User"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;