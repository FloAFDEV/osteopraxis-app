-- Supprimer la fonction existante et la recréer avec la bonne signature
DROP FUNCTION IF EXISTS cleanup_expired_demo_data();

-- Créer une fonction pour nettoyer automatiquement les données démo expirées
CREATE OR REPLACE FUNCTION cleanup_expired_demo_data()
RETURNS integer
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

  -- Nettoyer les utilisateurs démo dont l'email commence par "demo-"
  -- et qui ont été créés il y a plus de 30 minutes
  DELETE FROM public."User" 
  WHERE email LIKE 'demo-%@patienthub.com' 
  AND created_at < (NOW() - INTERVAL '30 minutes');
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