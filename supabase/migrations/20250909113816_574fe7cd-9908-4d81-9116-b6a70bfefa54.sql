-- 🚨 URGENCE HDS : BLOCAGE COMPLET DES DONNÉES SENSIBLES SUR SUPABASE
-- Cette migration bloque définitivement l'accès aux données HDS via Supabase

-- 1. PURGER IMMÉDIATEMENT toutes les données HDS existantes
TRUNCATE TABLE public."Patient" CASCADE;
TRUNCATE TABLE public."Consultation" CASCADE;
TRUNCATE TABLE public."MedicalDocument" CASCADE;
TRUNCATE TABLE public."TreatmentHistory" CASCADE;

-- 2. BLOQUER DÉFINITIVEMENT toutes les opérations HDS sur Supabase
-- Supprimer toutes les politiques RLS existantes pour les tables HDS
DROP POLICY IF EXISTS "Allow demo data access" ON public."Patient";
DROP POLICY IF EXISTS "HDS_ADMIN_ACCESS_WITH_AUDIT_PATIENT" ON public."Patient";
DROP POLICY IF EXISTS "Les admins peuvent tout voir et modifier sur Patient" ON public."Patient";
DROP POLICY IF EXISTS "admin_full_access_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_delete_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_insert_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_read_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_update_patients" ON public."Patient";

-- CRÉER UNE POLITIQUE DE BLOCAGE TOTAL POUR PATIENT
CREATE POLICY "HDS_TOTAL_BLOCK_PATIENT"
ON public."Patient"
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Même traitement pour Consultation
DROP POLICY IF EXISTS "Osteopaths can access consultations in their cabinets" ON public."Consultation";
DROP POLICY IF EXISTS "admin_full_access_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_create_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_delete_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_read_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_update_consultations" ON public."Consultation";

CREATE POLICY "HDS_TOTAL_BLOCK_CONSULTATION"
ON public."Consultation"
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Même traitement pour MedicalDocument
DROP POLICY IF EXISTS "Osteopaths can access medical documents in their cabinets" ON public."MedicalDocument";
DROP POLICY IF EXISTS "admin_full_access_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_create_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_delete_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_read_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_update_medical_documents" ON public."MedicalDocument";

CREATE POLICY "HDS_TOTAL_BLOCK_MEDICAL_DOCUMENT"
ON public."MedicalDocument"
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Même traitement pour TreatmentHistory
DROP POLICY IF EXISTS "Osteopaths can access treatment history in their cabinets" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "admin_full_access_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_create_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_delete_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_read_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_update_treatment_history" ON public."TreatmentHistory";

CREATE POLICY "HDS_TOTAL_BLOCK_TREATMENT_HISTORY"
ON public."TreatmentHistory"
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 3. AJOUTER DES FONCTIONS DE CONTRÔLE HDS
CREATE OR REPLACE FUNCTION public.hds_violation_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Logger toute tentative d'accès aux données HDS via Supabase
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    user_id,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    'HDS_VIOLATION',
    'ATTEMPTED_HDS_ACCESS_VIA_SUPABASE',
    jsonb_build_object(
      'severity', 'CRITICAL',
      'message', 'Tentative d''accès aux données HDS via Supabase - INTERDIT',
      'table', TG_TABLE_NAME,
      'timestamp', NOW()
    ),
    auth.uid(),
    inet_client_addr()
  );
  
  -- Bloquer complètement l'opération
  RAISE EXCEPTION 'ACCÈS HDS INTERDIT : Les données de santé ne peuvent pas transiter par Supabase. Utilisez le stockage local sécurisé.';
END;
$$;

-- Appliquer le trigger de contrôle sur toutes les tables HDS
CREATE TRIGGER hds_violation_trigger_patient
  BEFORE INSERT OR UPDATE OR DELETE ON public."Patient"
  FOR EACH ROW EXECUTE FUNCTION public.hds_violation_alert();

CREATE TRIGGER hds_violation_trigger_consultation
  BEFORE INSERT OR UPDATE OR DELETE ON public."Consultation"
  FOR EACH ROW EXECUTE FUNCTION public.hds_violation_alert();

CREATE TRIGGER hds_violation_trigger_medical_document
  BEFORE INSERT OR UPDATE OR DELETE ON public."MedicalDocument"
  FOR EACH ROW EXECUTE FUNCTION public.hds_violation_alert();

CREATE TRIGGER hds_violation_trigger_treatment_history
  BEFORE INSERT OR UPDATE OR DELETE ON public."TreatmentHistory"
  FOR EACH ROW EXECUTE FUNCTION public.hds_violation_alert();

-- 4. NOTIFICATION ADMIN
INSERT INTO public.admin_notifications (
  title,
  message,
  type,
  severity
) VALUES (
  'CONFORMITÉ HDS APPLIQUÉE',
  'Toutes les données HDS ont été purgées de Supabase et l''accès est désormais complètement bloqué. Seul le stockage local sécurisé est autorisé pour les données de santé.',
  'security',
  'info'
);