-- Corriger les problèmes de sécurité pour la table demo_sessions
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de gérer toutes les sessions
CREATE POLICY "Admins can manage all demo sessions" ON demo_sessions
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User" 
    WHERE "User".id = auth.uid() 
    AND "User".role = 'ADMIN'
  )
);

-- Politique pour permettre aux utilisateurs de voir leurs propres sessions
CREATE POLICY "Users can view their own demo sessions" ON demo_sessions
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Politique pour permettre la création de sessions de démo
CREATE POLICY "Allow creating demo sessions" ON demo_sessions
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Corriger la fonction cleanup avec un search_path sécurisé
CREATE OR REPLACE FUNCTION cleanup_expired_demo_sessions()
RETURNS TABLE(cleaned_sessions INTEGER, cleaned_patients INTEGER, cleaned_appointments INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Nettoyer les rendez-vous liés aux patients de démo
    DELETE FROM "Appointment" 
    WHERE "patientId" IN (
      SELECT id FROM "Patient" 
      WHERE (email LIKE '%temp.local' OR email LIKE 'patient-17%')
      AND "createdAt" >= expired_session.created_at
      AND "createdAt" <= expired_session.created_at + INTERVAL '35 minutes'
    );
    
    GET DIAGNOSTICS appointment_count = ROW_COUNT;
    
    -- Nettoyer les patients de démo
    DELETE FROM "Patient" 
    WHERE (email LIKE '%temp.local' OR email LIKE 'patient-17%')
    AND "createdAt" >= expired_session.created_at
    AND "createdAt" <= expired_session.created_at + INTERVAL '35 minutes';
    
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
$$;