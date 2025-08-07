-- =================================================================
-- MIGRATION HDS: Politiques RLS de Blocage pour Données Sensibles
-- =================================================================

-- Fonction d'audit pour accès admin aux données sensibles
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

-- =================================================================
-- BLOQUER complètement l'accès aux tables sensibles
-- =================================================================

-- 1. Supprimer toutes les anciennes politiques Patient
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

-- Nouvelle politique de blocage complet
CREATE POLICY "HDS_BLOCK_ALL_PATIENT_ACCESS" ON public."Patient" 
FOR ALL USING (false) WITH CHECK (false);

-- Politique admin avec audit
CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_PATIENT" ON public."Patient" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

-- 2. Supprimer toutes les anciennes politiques Appointment
DROP POLICY IF EXISTS "osteopath_strict_appointment_access" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_create_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_read_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_update_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "osteopath_delete_appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can access their appointments" ON public."Appointment";

CREATE POLICY "HDS_BLOCK_ALL_APPOINTMENT_ACCESS" ON public."Appointment" 
FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_APPOINTMENT" ON public."Appointment" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());

-- 3. Supprimer toutes les anciennes politiques Invoice
DROP POLICY IF EXISTS "osteopath_strict_invoice_access" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_create_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_read_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_update_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "osteopath_delete_invoices" ON public."Invoice";
DROP POLICY IF EXISTS "Osteopaths can access their invoices" ON public."Invoice";

CREATE POLICY "HDS_BLOCK_ALL_INVOICE_ACCESS" ON public."Invoice" 
FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "HDS_ADMIN_ACCESS_WITH_AUDIT_INVOICE" ON public."Invoice" 
FOR ALL TO authenticated USING (public.admin_access_with_audit());