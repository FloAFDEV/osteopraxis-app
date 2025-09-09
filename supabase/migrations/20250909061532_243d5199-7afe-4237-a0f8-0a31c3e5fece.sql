-- Fonction pour nettoyer les logs anciens
CREATE OR REPLACE FUNCTION admin_cleanup_old_logs(days_old INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  deleted_count INTEGER;
  result JSON;
BEGIN
  -- Supprimer les logs de plus de X jours
  DELETE FROM system_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Créer un log de l'opération
  INSERT INTO system_logs (log_level, message, metadata)
  VALUES (
    'INFO',
    'Nettoyage automatique des logs effectué',
    json_build_object(
      'deleted_count', deleted_count,
      'days_old', days_old,
      'cleanup_date', NOW()
    )
  );
  
  result := json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'message', format('Suppression de %s logs de plus de %s jours', deleted_count, days_old)
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir l'utilisation de l'espace disque
CREATE OR REPLACE FUNCTION admin_get_storage_usage()
RETURNS JSON AS $$
DECLARE
  result JSON;
  table_sizes JSON;
BEGIN
  -- Calculer la taille de chaque table importante
  WITH table_sizes_calc AS (
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      pg_total_relation_size(schemaname||'.'||tablename) as bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN ('Patient', 'Appointment', 'Invoice', 'Osteopath', 'Cabinet')
    ORDER BY bytes DESC
  )
  SELECT json_agg(
    json_build_object(
      'table', tablename,
      'size', size,
      'bytes', bytes
    )
  ) INTO table_sizes
  FROM table_sizes_calc;
  
  result := json_build_object(
    'table_sizes', COALESCE(table_sizes, '[]'::json),
    'total_database_size', pg_size_pretty(pg_database_size(current_database())),
    'generated_at', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour optimiser les performances
CREATE OR REPLACE FUNCTION admin_optimize_performance()
RETURNS JSON AS $$
DECLARE
  result JSON;
  vacuum_count INTEGER := 0;
  analyze_count INTEGER := 0;
BEGIN
  -- Vacuum et analyze sur les tables principales
  VACUUM ANALYZE "Patient";
  vacuum_count := vacuum_count + 1;
  analyze_count := analyze_count + 1;
  
  VACUUM ANALYZE "Appointment"; 
  vacuum_count := vacuum_count + 1;
  analyze_count := analyze_count + 1;
  
  VACUUM ANALYZE "Invoice";
  vacuum_count := vacuum_count + 1;
  analyze_count := analyze_count + 1;
  
  VACUUM ANALYZE "Osteopath";
  vacuum_count := vacuum_count + 1;
  analyze_count := analyze_count + 1;
  
  VACUUM ANALYZE "Cabinet";
  vacuum_count := vacuum_count + 1;
  analyze_count := analyze_count + 1;
  
  -- Log de l'opération
  INSERT INTO system_logs (log_level, message, metadata)
  VALUES (
    'INFO',
    'Optimisation des performances effectuée',
    json_build_object(
      'vacuum_operations', vacuum_count,
      'analyze_operations', analyze_count,
      'optimization_date', NOW()
    )
  );
  
  result := json_build_object(
    'success', true,
    'vacuum_operations', vacuum_count,
    'analyze_operations', analyze_count,
    'message', 'Optimisation des performances terminée avec succès'
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer un rapport d'utilisation détaillé
CREATE OR REPLACE FUNCTION admin_generate_usage_report()
RETURNS JSON AS $$
DECLARE
  result JSON;
  stats JSON;
  activity JSON;
BEGIN
  -- Statistiques générales
  WITH stats_calc AS (
    SELECT 
      (SELECT COUNT(*) FROM "Patient" WHERE deleted_at IS NULL) as active_patients,
      (SELECT COUNT(*) FROM "Patient" WHERE deleted_at IS NOT NULL) as deleted_patients,
      (SELECT COUNT(*) FROM "Appointment" WHERE deleted_at IS NULL AND date >= CURRENT_DATE - INTERVAL '30 days') as recent_appointments,
      (SELECT COUNT(*) FROM "Invoice" WHERE deleted_at IS NULL AND date >= CURRENT_DATE - INTERVAL '30 days') as recent_invoices,
      (SELECT COUNT(*) FROM "Osteopath" WHERE deleted_at IS NULL) as active_osteopaths,
      (SELECT COUNT(*) FROM "Cabinet" WHERE deleted_at IS NULL) as active_cabinets
  )
  SELECT json_build_object(
    'active_patients', active_patients,
    'deleted_patients', deleted_patients,
    'recent_appointments', recent_appointments,
    'recent_invoices', recent_invoices,
    'active_osteopaths', active_osteopaths,
    'active_cabinets', active_cabinets
  ) INTO stats
  FROM stats_calc;
  
  -- Activité récente par jour (7 derniers jours)
  WITH activity_calc AS (
    SELECT 
      DATE(created_at) as activity_date,
      COUNT(*) as appointments_count
    FROM "Appointment"
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND deleted_at IS NULL
    GROUP BY DATE(created_at)
    ORDER BY activity_date DESC
  )
  SELECT json_agg(
    json_build_object(
      'date', activity_date,
      'appointments', appointments_count
    )
  ) INTO activity
  FROM activity_calc;
  
  result := json_build_object(
    'statistics', stats,
    'recent_activity', COALESCE(activity, '[]'::json),
    'generated_at', NOW(),
    'period', '7 days'
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;