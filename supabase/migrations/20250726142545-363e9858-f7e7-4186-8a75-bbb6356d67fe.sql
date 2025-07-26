-- PHASE 1: Corrections critiques de sécurité

-- 1. Correction des fonctions avec search_path mutable (35 fonctions)
-- Note: Cette migration sécurise les fonctions existantes en fixant leur search_path

-- Fonction pour mettre à jour automatiquement les timestamps
ALTER FUNCTION update_updated_at_column() SET search_path = public, extensions;

-- Fonctions de gestion des utilisateurs et authentification
ALTER FUNCTION handle_new_user() SET search_path = public, extensions;
ALTER FUNCTION update_user_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des ostéopathes
ALTER FUNCTION update_osteopath_updated_at() SET search_path = public, extensions;
ALTER FUNCTION handle_osteopath_profile_completion() SET search_path = public, extensions;

-- Fonctions de gestion des cabinets
ALTER FUNCTION update_cabinet_updated_at() SET search_path = public, extensions;
ALTER FUNCTION update_cabinet_timestamps() SET search_path = public, extensions;

-- Fonctions de gestion des patients
ALTER FUNCTION update_patient_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des rendez-vous
ALTER FUNCTION update_appointment_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des factures
ALTER FUNCTION update_invoice_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des consultations
ALTER FUNCTION update_consultation_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des documents médicaux
ALTER FUNCTION update_medical_document_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des devis
ALTER FUNCTION update_quote_updated_at() SET search_path = public, extensions;
ALTER FUNCTION update_quote_item_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion de l'historique des traitements
ALTER FUNCTION update_treatment_history_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion des relations patients
ALTER FUNCTION update_patient_relationships_updated_at() SET search_path = public, extensions;

-- Fonctions de gestion du profil professionnel
ALTER FUNCTION update_professional_profile_updated_at() SET search_path = public, extensions;

-- 2. Activation de RLS sur la table subscription_plans (CRITIQUE)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Politique pour subscription_plans : seuls les admins peuvent accéder
CREATE POLICY "admin_only_subscription_plans" ON public.subscription_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.User 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 3. Suppression des politiques de développement dangereuses (accès ouvert)
DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Appointment" ON public.Appointment;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Appointment" ON public.Appointment;
DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Cabinet" ON public.Cabinet;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Cabinet" ON public.Cabinet;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Consultation" ON public.Consultation;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Invoice" ON public.Invoice;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur MedicalDocument" ON public.MedicalDocument;
DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Osteopath" ON public.Osteopath;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Osteopath" ON public.Osteopath;
DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Patient" ON public.Patient;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Patient" ON public.Patient;
DROP POLICY IF EXISTS "dev_open_access_patient" ON public.Patient;
DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier" ON public.User;
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire" ON public.User;

-- 4. Renforcement des politiques des données sensibles (patients, rendez-vous, factures)
-- Ces données seront bientôt migrées vers SQLite local, mais sécurisons-les d'abord

-- Politiques strictes pour les patients
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.Patient;
CREATE POLICY "osteopath_strict_patient_access" ON public.Patient
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.Osteopath o
    WHERE o.userId = auth.uid()
    AND o.id = Patient.osteopathId
  )
);

-- Politiques strictes pour les rendez-vous
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.Appointment;
CREATE POLICY "osteopath_strict_appointment_access" ON public.Appointment
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.Osteopath o
    WHERE o.userId = auth.uid()
    AND o.id = Appointment.osteopathId
  )
);

-- Politiques strictes pour les factures
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.Invoice;
CREATE POLICY "osteopath_strict_invoice_access" ON public.Invoice
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.Osteopath o
    WHERE o.userId = auth.uid()
    AND o.id = Invoice.osteopathId
  )
);

-- 5. Sécurisation du stockage des fichiers
-- Restriction stricte pour les tampons (stamps)
DROP POLICY IF EXISTS "Authenticated users can view stamps" ON storage.objects;
CREATE POLICY "osteopath_own_stamps_only" ON storage.objects
FOR ALL ON storage.objects USING (
  bucket_id = 'stamps' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Restriction pour les images de cabinets (seuls les propriétaires)
DROP POLICY IF EXISTS "Autoriser l'accès public aux images des cabinets" ON storage.objects;
CREATE POLICY "cabinet_owner_images_only" ON storage.objects
FOR ALL ON storage.objects USING (
  bucket_id = 'cabinet-images' AND 
  EXISTS (
    SELECT 1 FROM public.Cabinet c
    INNER JOIN public.Osteopath o ON c.osteopathId = o.id
    WHERE o.userId = auth.uid()
    AND c.id::text = (storage.foldername(name))[1]
  )
);

-- 6. Audit et traçabilité renforcés
-- Fonction pour logger les accès sensibles
CREATE OR REPLACE FUNCTION log_sensitive_access(
  table_name text,
  operation text,
  record_id bigint
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    operation,
    table_name,
    record_id,
    jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent',
      'ip', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    now()
  );
END;
$$;

-- Trigger pour auditer les accès aux patients
CREATE OR REPLACE FUNCTION audit_patient_access() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_OP = 'SELECT' THEN
    PERFORM log_sensitive_access('Patient', 'VIEW', OLD.id);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_sensitive_access('Patient', 'UPDATE', NEW.id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_sensitive_access('Patient', 'DELETE', OLD.id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;