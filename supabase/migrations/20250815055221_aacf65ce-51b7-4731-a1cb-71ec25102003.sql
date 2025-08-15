-- Ajouter des champs pour identifier et gérer les données de démo
ALTER TABLE public."Patient" ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;
ALTER TABLE public."Patient" ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public."Appointment" ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;
ALTER TABLE public."Appointment" ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public."Invoice" ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;
ALTER TABLE public."Invoice" ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public."Osteopath" ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;
ALTER TABLE public."Osteopath" ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public."Cabinet" ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;
ALTER TABLE public."Cabinet" ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Créer une fonction pour nettoyer les données de démo expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_demo_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Nettoyer les factures de démo expirées
  DELETE FROM public."Invoice" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les rendez-vous de démo expirés
  DELETE FROM public."Appointment" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les patients de démo expirés
  DELETE FROM public."Patient" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les cabinets de démo expirés
  DELETE FROM public."Cabinet" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Nettoyer les ostéopathes de démo expirés
  DELETE FROM public."Osteopath" 
  WHERE is_demo_data = true 
  AND demo_expires_at < NOW();
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Logger le nettoyage
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values
  ) VALUES (
    'demo_cleanup',
    'system',
    'DEMO_CLEANUP',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'timestamp', NOW()
    )
  );

  RETURN deleted_count;
END;
$$;

-- Créer des politiques RLS pour permettre l'accès aux données de démo
CREATE POLICY "Allow demo data access" ON public."Patient"
  FOR ALL USING (is_demo_data = true)
  WITH CHECK (is_demo_data = true);

CREATE POLICY "Allow demo data access" ON public."Appointment"
  FOR ALL USING (is_demo_data = true)
  WITH CHECK (is_demo_data = true);

CREATE POLICY "Allow demo data access" ON public."Invoice"
  FOR ALL USING (is_demo_data = true)
  WITH CHECK (is_demo_data = true);

CREATE POLICY "Allow demo data access" ON public."Osteopath"
  FOR ALL USING (is_demo_data = true)
  WITH CHECK (is_demo_data = true);

CREATE POLICY "Allow demo data access" ON public."Cabinet"
  FOR ALL USING (is_demo_data = true)
  WITH CHECK (is_demo_data = true);