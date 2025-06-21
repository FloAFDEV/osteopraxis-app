
-- Étape 1 : Nettoyer complètement toutes les politiques existantes sur toutes les tables
-- Patient
DROP POLICY IF EXISTS "osteopath_read_patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_create_patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_update_patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_delete_patients" ON "Patient";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire" ON "Patient";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "Patient";
DROP POLICY IF EXISTS "Allow all operations" ON "Patient";

-- Appointment
DROP POLICY IF EXISTS "osteopath_read_appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_create_appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_update_appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_delete_appointments" ON "Appointment";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire" ON "Appointment";
DROP POLICY IF EXISTS "Enable all operations" ON "Appointment";

-- Invoice
DROP POLICY IF EXISTS "osteopath_read_invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_create_invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_update_invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_delete_invoices" ON "Invoice";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire" ON "Invoice";
DROP POLICY IF EXISTS "Enable all operations" ON "Invoice";

-- Cabinet
DROP POLICY IF EXISTS "osteopath_read_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_create_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_update_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_delete_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire" ON "Cabinet";
DROP POLICY IF EXISTS "Enable all operations" ON "Cabinet";

-- Consultation
DROP POLICY IF EXISTS "osteopath_read_consultations" ON "Consultation";
DROP POLICY IF EXISTS "osteopath_create_consultations" ON "Consultation";
DROP POLICY IF EXISTS "osteopath_update_consultations" ON "Consultation";
DROP POLICY IF EXISTS "osteopath_delete_consultations" ON "Consultation";

-- MedicalDocument
DROP POLICY IF EXISTS "osteopath_read_medical_documents" ON "MedicalDocument";
DROP POLICY IF EXISTS "osteopath_create_medical_documents" ON "MedicalDocument";
DROP POLICY IF EXISTS "osteopath_update_medical_documents" ON "MedicalDocument";
DROP POLICY IF EXISTS "osteopath_delete_medical_documents" ON "MedicalDocument";

-- TreatmentHistory
DROP POLICY IF EXISTS "osteopath_read_treatment_history" ON "TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_create_treatment_history" ON "TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_update_treatment_history" ON "TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_delete_treatment_history" ON "TreatmentHistory";

-- Quote et QuoteItem
DROP POLICY IF EXISTS "Osteopaths can view their own quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can create quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can update their own quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can delete their own quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can manage quote items" ON "QuoteItem";

-- Étape 2 : Activer RLS sur toutes les tables
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cabinet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Consultation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreatmentHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteItem" ENABLE ROW LEVEL SECURITY;

-- Étape 3 : Créer les politiques sécurisées pour Patient
CREATE POLICY "osteopath_read_patients" ON "Patient"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Patient"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_patients" ON "Patient"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Patient"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_patients" ON "Patient"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Patient"."osteopathId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Patient"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_patients" ON "Patient"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Patient"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

-- Étape 4 : Créer les politiques sécurisées pour Appointment
CREATE POLICY "osteopath_read_appointments" ON "Appointment"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Appointment"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_appointments" ON "Appointment"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Appointment"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_appointments" ON "Appointment"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Appointment"."osteopathId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Appointment"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_appointments" ON "Appointment"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Appointment"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

-- Étape 5 : Créer les politiques sécurisées pour Invoice
CREATE POLICY "osteopath_read_invoices" ON "Invoice"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Invoice"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_invoices" ON "Invoice"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Invoice"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_invoices" ON "Invoice"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Invoice"."osteopathId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Invoice"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_invoices" ON "Invoice"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Invoice"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

-- Étape 6 : Créer les politiques sécurisées pour Cabinet
CREATE POLICY "osteopath_read_cabinets" ON "Cabinet"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Cabinet"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_cabinets" ON "Cabinet"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Cabinet"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_cabinets" ON "Cabinet"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Cabinet"."osteopathId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Cabinet"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_cabinets" ON "Cabinet"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Cabinet"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

-- Étape 7 : Créer les politiques pour les tables liées aux patients
CREATE POLICY "osteopath_read_consultations" ON "Consultation"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "Consultation"."patientId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_consultations" ON "Consultation"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "Consultation"."patientId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_consultations" ON "Consultation"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "Consultation"."patientId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_consultations" ON "Consultation"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "Consultation"."patientId"
    AND o."authId" = auth.uid()
  )
);

-- Politiques pour MedicalDocument
CREATE POLICY "osteopath_read_medical_documents" ON "MedicalDocument"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "MedicalDocument"."patientId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_medical_documents" ON "MedicalDocument"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "MedicalDocument"."patientId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_medical_documents" ON "MedicalDocument"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "MedicalDocument"."patientId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_medical_documents" ON "MedicalDocument"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = "MedicalDocument"."patientId"
    AND o."authId" = auth.uid()
  )
);

-- Politiques pour TreatmentHistory
CREATE POLICY "osteopath_read_treatment_history" ON "TreatmentHistory"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Consultation" c
    JOIN "Patient" p ON p.id = c."patientId"
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE c.id = "TreatmentHistory"."consultationId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_treatment_history" ON "TreatmentHistory"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Consultation" c
    JOIN "Patient" p ON p.id = c."patientId"
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE c.id = "TreatmentHistory"."consultationId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_treatment_history" ON "TreatmentHistory"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Consultation" c
    JOIN "Patient" p ON p.id = c."patientId"
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE c.id = "TreatmentHistory"."consultationId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_treatment_history" ON "TreatmentHistory"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Consultation" c
    JOIN "Patient" p ON p.id = c."patientId"
    JOIN "Osteopath" o ON o.id = p."osteopathId"
    WHERE c.id = "TreatmentHistory"."consultationId"
    AND o."authId" = auth.uid()
  )
);

-- Politiques pour Quote et QuoteItem
CREATE POLICY "osteopath_read_quotes" ON "Quote"
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_create_quotes" ON "Quote"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_update_quotes" ON "Quote"
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_delete_quotes" ON "Quote"
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "osteopath_manage_quote_items" ON "QuoteItem"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Quote" q
    JOIN "Osteopath" o ON o.id = q."osteopathId"
    WHERE q.id = "QuoteItem"."quoteId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Quote" q
    JOIN "Osteopath" o ON o.id = q."osteopathId"
    WHERE q.id = "QuoteItem"."quoteId"
    AND o."authId" = auth.uid()
  )
);
