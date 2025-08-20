-- Activer les extensions nécessaires pour le nettoyage automatique
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Création d'une table pour traquer les sessions de démonstration et leur nettoyage
CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  cleaned_up_at TIMESTAMP WITH TIME ZONE,
  data_types TEXT[] DEFAULT '{}',
  is_demo BOOLEAN DEFAULT true
);

-- Index pour les requêtes de nettoyage
CREATE INDEX IF NOT EXISTS idx_demo_sessions_expires_cleaned 
ON demo_sessions(expires_at, cleaned_up_at) 
WHERE cleaned_up_at IS NULL;

-- Index pour les sessions actives
CREATE INDEX IF NOT EXISTS idx_demo_sessions_active 
ON demo_sessions(session_id, expires_at) 
WHERE cleaned_up_at IS NULL;

-- Fonction pour nettoyer automatiquement les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_demo_sessions()
RETURNS TABLE(cleaned_sessions INTEGER, cleaned_patients INTEGER, cleaned_appointments INTEGER) AS $$
DECLARE
  session_count INTEGER := 0;
  patient_count INTEGER := 0;
  appointment_count INTEGER := 0;
  expired_session RECORD;
BEGIN
  -- Trouver les sessions expirées non nettoyées
  FOR expired_session IN 
    SELECT id, session_id, user_id, created_at 
    FROM demo_sessions 
    WHERE expires_at < NOW() 
    AND cleaned_up_at IS NULL 
    AND is_demo = true
  LOOP
    -- Nettoyer les patients de démonstration créés dans cette session
    DELETE FROM appointments 
    WHERE patient_id IN (
      SELECT id FROM patients 
      WHERE (email LIKE '%temp.local' OR email LIKE 'patient-17%')
      AND created_at >= expired_session.created_at
      AND created_at <= expired_session.created_at + INTERVAL '35 minutes'
    );
    
    GET DIAGNOSTICS appointment_count = ROW_COUNT;
    
    DELETE FROM patients 
    WHERE (email LIKE '%temp.local' OR email LIKE 'patient-17%')
    AND created_at >= expired_session.created_at
    AND created_at <= expired_session.created_at + INTERVAL '35 minutes';
    
    GET DIAGNOSTICS patient_count = ROW_COUNT;
    
    -- Marquer la session comme nettoyée
    UPDATE demo_sessions 
    SET cleaned_up_at = NOW() 
    WHERE id = expired_session.id;
    
    session_count := session_count + 1;
  END LOOP;
  
  -- Retourner les statistiques
  RETURN QUERY SELECT session_count, patient_count, appointment_count;
END;
$$ LANGUAGE plpgsql;