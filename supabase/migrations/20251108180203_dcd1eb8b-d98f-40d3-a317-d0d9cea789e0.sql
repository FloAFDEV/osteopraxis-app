-- Phase 1.1: Bloquer accès données démo en RLS
-- Les utilisateurs réels ne doivent PAS voir les données is_demo_data = true

-- Policy pour Invoice
DROP POLICY IF EXISTS "block_real_users_demo_data_invoice" ON public."Invoice";
CREATE POLICY "block_real_users_demo_data_invoice" ON public."Invoice"
FOR ALL
USING (
  (is_demo_data IS NOT TRUE) OR 
  (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE 'demo-%@patienthub.com'))
);

-- Policy pour Appointment
DROP POLICY IF EXISTS "block_real_users_demo_data_appointment" ON public."Appointment";
CREATE POLICY "block_real_users_demo_data_appointment" ON public."Appointment"
FOR ALL
USING (
  (is_demo_data IS NOT TRUE) OR 
  (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE 'demo-%@patienthub.com'))
);

-- Policy pour Cabinet
DROP POLICY IF EXISTS "block_real_users_demo_data_cabinet" ON public."Cabinet";
CREATE POLICY "block_real_users_demo_data_cabinet" ON public."Cabinet"
FOR ALL
USING (
  (is_demo_data IS NOT TRUE) OR 
  (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE 'demo-%@patienthub.com'))
);

-- Policy pour Patient (données sensibles HDS mais on bloque quand même)
DROP POLICY IF EXISTS "block_real_users_demo_data_patient" ON public."Patient";
CREATE POLICY "block_real_users_demo_data_patient" ON public."Patient"
FOR ALL
USING (
  (is_demo_data IS NOT TRUE) OR 
  (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE 'demo-%@patienthub.com'))
);

-- Phase 1.3: Créer table document_exports pour audit trail
CREATE TABLE IF NOT EXISTS public.document_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('invoice_pdf', 'patient_pdf', 'accounting_excel', 'quote_pdf')),
  document_id INTEGER, -- ID de l'invoice, quote, patient, etc.
  document_reference TEXT, -- Numéro facture, référence document
  exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_hash TEXT, -- SHA-256 du fichier exporté pour vérification
  file_size_bytes INTEGER,
  is_demo_export BOOLEAN NOT NULL DEFAULT false,
  recipient_info JSONB DEFAULT '{}'::jsonb, -- Patient info si applicable
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS sur document_exports
ALTER TABLE public.document_exports ENABLE ROW LEVEL SECURITY;

-- Policy: Osteopathes peuvent voir leurs propres exports
CREATE POLICY "osteopath_view_own_exports" ON public.document_exports
FOR SELECT
USING (osteopath_id = public.get_current_osteopath_id_secure());

-- Policy: Osteopathes peuvent créer leurs propres exports
CREATE POLICY "osteopath_create_exports" ON public.document_exports
FOR INSERT
WITH CHECK (osteopath_id = public.get_current_osteopath_id_secure());

-- Policy: Admins peuvent tout voir
CREATE POLICY "admin_view_all_exports" ON public.document_exports
FOR ALL
USING (public.is_admin_secure());

-- Index pour performance
CREATE INDEX idx_document_exports_osteopath ON public.document_exports(osteopath_id);
CREATE INDEX idx_document_exports_date ON public.document_exports(exported_at DESC);
CREATE INDEX idx_document_exports_type ON public.document_exports(export_type);
CREATE INDEX idx_document_exports_hash ON public.document_exports(file_hash);

-- Fonction helper pour enregistrer un export
CREATE OR REPLACE FUNCTION public.log_document_export(
  p_osteopath_id INTEGER,
  p_export_type TEXT,
  p_document_id INTEGER DEFAULT NULL,
  p_document_reference TEXT DEFAULT NULL,
  p_file_hash TEXT DEFAULT NULL,
  p_file_size_bytes INTEGER DEFAULT NULL,
  p_is_demo_export BOOLEAN DEFAULT false,
  p_recipient_info JSONB DEFAULT '{}'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  export_id uuid;
BEGIN
  INSERT INTO public.document_exports (
    osteopath_id,
    export_type,
    document_id,
    document_reference,
    file_hash,
    file_size_bytes,
    is_demo_export,
    recipient_info,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_osteopath_id,
    p_export_type,
    p_document_id,
    p_document_reference,
    p_file_hash,
    p_file_size_bytes,
    p_is_demo_export,
    p_recipient_info,
    p_metadata,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  )
  RETURNING id INTO export_id;
  
  RETURN export_id;
END;
$$;

COMMENT ON TABLE public.document_exports IS 'Audit trail de tous les exports de documents (PDF, Excel) pour traçabilité et sécurité';
COMMENT ON FUNCTION public.log_document_export IS 'Enregistre un export de document avec métadonnées complètes pour audit';