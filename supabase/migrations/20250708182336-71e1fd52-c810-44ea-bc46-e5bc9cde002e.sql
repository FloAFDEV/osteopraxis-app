-- Table pour les logs d'audit
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);

-- RLS pour les logs d'audit (seuls les admins peuvent voir)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (is_admin());

-- Fonction pour logger automatiquement les actions
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des colonnes pour le soft delete
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE public."Patient" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public."Patient" ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE public."Appointment" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public."Appointment" ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE public."Invoice" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public."Invoice" ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Fonction pour soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_record(
  p_table_name TEXT,
  p_record_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin() THEN
    RETURN FALSE;
  END IF;

  -- Construire la requête de soft delete
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NOW(), deleted_by = auth.uid() WHERE id = %L AND deleted_at IS NULL',
    p_table_name,
    p_record_id
  );
  
  -- Exécuter la requête
  EXECUTE sql_query;
  
  -- Logger l'action
  PERFORM log_audit_action('SOFT_DELETE', p_table_name, p_record_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour restaurer un enregistrement soft deleted
CREATE OR REPLACE FUNCTION public.restore_record(
  p_table_name TEXT,
  p_record_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin() THEN
    RETURN FALSE;
  END IF;

  -- Construire la requête de restauration
  sql_query := format(
    'UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = %L',
    p_table_name,
    p_record_id
  );
  
  -- Exécuter la requête
  EXECUTE sql_query;
  
  -- Logger l'action
  PERFORM log_audit_action('RESTORE', p_table_name, p_record_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour les policies pour exclure les enregistrements soft deleted
-- Pour User (exemple, à appliquer sur d'autres tables si nécessaire)
DROP POLICY IF EXISTS "Exclude soft deleted users" ON public."User";
CREATE POLICY "Exclude soft deleted users" ON public."User"
  FOR SELECT USING (deleted_at IS NULL OR is_admin());

-- Ajouter une colonne is_active pour les utilisateurs
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;