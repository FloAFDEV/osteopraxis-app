/**
 * Politiques RLS strictes pour bloquer l'accès aux données sensibles dans Supabase
 * APRÈS migration HDS, ces tables ne doivent PLUS être accessibles
 */

/**
 * SQL pour créer des politiques RLS qui BLOQUENT complètement l'accès
 * aux tables contenant des données sensibles
 */
export const BLOCKING_RLS_POLICIES = `
-- =================================================================
-- POLITIQUES RLS DE BLOCAGE HDS
-- Ces politiques BLOQUENT COMPLÈTEMENT l'accès aux données sensibles
-- =================================================================

-- 1. BLOQUER complètement la table Patient
DROP POLICY IF EXISTS "osteopath_strict_patient_access" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_strict_patient_management" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_create_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_read_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_update_patients" ON public."Patient";
DROP POLICY IF EXISTS "osteopath_delete_patients" ON public."Patient";
DROP POLICY IF EXISTS "Les ostéopathes peuvent créer des patients" ON public."Patient";
DROP POLICY IF EXISTS "Les ostéopathes peuvent modifier leurs propres patients" ON public."Patient";
DROP POLICY IF EXISTS "Les ostéopathes peuvent voir leurs propres patients" ON public."Patient";
DROP POLICY IF EXISTS "Osteopaths can access their patients" ON public."Patient";
DROP POLICY IF EXISTS "Osteopaths can manage their own patients" ON public."Patient";

CREATE POLICY "HDS_BLOCK_ALL_PATIENT_ACCESS" ON public."Patient" 
FOR ALL USING (false) WITH CHECK (false);

-- 2. BLOQUER complètement la table Appointment
DROP POLICY IF EXISTS "osteopath_strict_appointment_access" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_create_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_read_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_update_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_delete_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can access their appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can create their own appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can update their own appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can view their own appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can delete their own appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can manage their own appointments" ON public."Appointment";

CREATE POLICY "HDS_BLOCK_ALL_APPOINTMENT_ACCESS" ON public."Appointment" 
FOR ALL USING (false) WITH CHECK (false);

-- 3. BLOQUER complètement la table Invoice
DROP POLICY IF EXISTS "osteopath_strict_invoice_access" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_create_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_read_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_update_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_delete_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "Osteopaths can access their invoices" ON public."Invoice";
DROP POLICY IF EXISTS "Osteopaths can manage their own invoices" ON public."Invoice";

CREATE POLICY "HDS_BLOCK_ALL_INVOICE_ACCESS" ON public."Invoice" 
FOR ALL USING (false) WITH CHECK (false);

-- 4. BLOQUER complètement la table Consultation
DROP POLICY IF EXISTS "osteopath_create_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_read_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_update_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "osteopath_delete_consultations" ON public."Consultation";
DROP POLICY IF EXISTS "Osteopaths can access consultations in their cabinets" ON public."Consultation";

CREATE POLICY "HDS_BLOCK_ALL_CONSULTATION_ACCESS" ON public."Consultation" 
FOR ALL USING (false) WITH CHECK (false);

-- 5. BLOQUER complètement la table MedicalDocument
DROP POLICY IF EXISTS "osteopath_create_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_read_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_update_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "osteopath_delete_medical_documents" ON public."MedicalDocument";
DROP POLICY IF EXISTS "Osteopaths can access medical documents in their cabinets" ON public."MedicalDocument";

CREATE POLICY "HDS_BLOCK_ALL_MEDICAL_DOCUMENT_ACCESS" ON public."MedicalDocument" 
FOR ALL USING (false) WITH CHECK (false);

-- 6. BLOQUER complètement la table TreatmentHistory
DROP POLICY IF EXISTS "osteopath_create_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_read_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_update_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "osteopath_delete_treatment_history" ON public."TreatmentHistory";
DROP POLICY IF EXISTS "Osteopaths can access treatment history in their cabinets" ON public."TreatmentHistory";

CREATE POLICY "HDS_BLOCK_ALL_TREATMENT_HISTORY_ACCESS" ON public."TreatmentHistory" 
FOR ALL USING (false) WITH CHECK (false);

-- 7. BLOQUER complètement la table Quote
DROP POLICY IF EXISTS "osteopath_create_quotes" ON public."Quote";
DROP POLICY IF EXISTS "osteopath_read_quotes" ON public."Quote";
DROP POLICY IF EXISTS "osteopath_update_quotes" ON public."Quote";
DROP POLICY IF EXISTS "osteopath_delete_quotes" ON public."Quote";
DROP POLICY IF EXISTS "Osteopaths can access their quotes" ON public."Quote";
DROP POLICY IF EXISTS "Users can create their own quotes" ON public."Quote";
DROP POLICY IF EXISTS "Users can delete their own quotes" ON public."Quote";
DROP POLICY IF EXISTS "Users can update their own quotes" ON public."Quote";
DROP POLICY IF EXISTS "Users can view their own quotes" ON public."Quote";

CREATE POLICY "HDS_BLOCK_ALL_QUOTE_ACCESS" ON public."Quote" 
FOR ALL USING (false) WITH CHECK (false);

-- 8. BLOQUER complètement la table QuoteItem
DROP POLICY IF EXISTS "osteopath_manage_quote_items" ON public."QuoteItem";
DROP POLICY IF EXISTS "Users can create their own quote items" ON public."QuoteItem";
DROP POLICY IF EXISTS "Users can delete their own quote items" ON public."QuoteItem";
DROP POLICY IF EXISTS "Users can update their own quote items" ON public."QuoteItem";
DROP POLICY IF EXISTS "Users can view their own quote items" ON public."QuoteItem";

CREATE POLICY "HDS_BLOCK_ALL_QUOTE_ITEM_ACCESS" ON public."QuoteItem" 
FOR ALL USING (false) WITH CHECK (false);

-- =================================================================
-- GARDER l'accès admin pour maintenance (avec logging)
-- =================================================================

-- Créer une politique admin avec logging obligatoire
CREATE OR REPLACE FUNCTION public.admin_access_with_audit()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que c'est un admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Logger l'accès admin aux données sensibles
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    user_id
  ) VALUES (
    'SENSITIVE_DATA_ACCESS',
    'admin_access',
    'HDS_ADMIN_ACCESS',
    jsonb_build_object(
      'timestamp', NOW(),
      'warning', 'Admin accessing sensitive data that should be local'
    ),
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO '';

-- Appliquer la politique admin avec audit à toutes les tables sensibles
CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_PATIENT" ON public."Patient" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_APPOINTMENT" ON public."Appointment" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_INVOICE" ON public."Invoice" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_CONSULTATION" ON public."Consultation" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_MEDICAL_DOCUMENT" ON public."MedicalDocument" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_TREATMENT_HISTORY" ON public."TreatmentHistory" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_QUOTE" ON public."Quote" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_QUOTE_ITEM" ON public."QuoteItem" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());
`;

/**
 * Fonction pour appliquer les politiques de blocage HDS
 */
export async function applyHDSBlockingPolicies(): Promise<void> {
  console.log('🛡️ Application des politiques RLS de blocage HDS...');
  
  // Cette migration sera exécutée via Supabase
  // Les politiques SQL ci-dessus doivent être appliquées manuellement
  // ou via une migration Supabase
  
  console.log('⚠️ IMPORTANT: Les politiques RLS de blocage doivent être appliquées via Supabase');
  console.log('📋 Exécutez le SQL de BLOCKING_RLS_POLICIES dans votre console Supabase');
}