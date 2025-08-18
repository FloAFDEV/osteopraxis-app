-- Créer une fonction pour nettoyer automatiquement les données démo expirées
CREATE OR REPLACE FUNCTION cleanup_expired_demo_data()
RETURNS TABLE(deleted_count integer)
LANGUAGE plpgsql
AS $$
DECLARE
    user_count integer := 0;
    patient_count integer := 0;
    appointment_count integer := 0;
    invoice_count integer := 0;
    cabinet_count integer := 0;
    osteopath_count integer := 0;
    total_deleted integer := 0;
BEGIN
    -- Supprimer les factures démo expirées
    DELETE FROM "Invoice" 
    WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
    GET DIAGNOSTICS invoice_count = ROW_COUNT;
    
    -- Supprimer les rendez-vous démo expirés
    DELETE FROM "Appointment" 
    WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
    GET DIAGNOSTICS appointment_count = ROW_COUNT;
    
    -- Supprimer les patients démo expirés
    DELETE FROM "Patient" 
    WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
    GET DIAGNOSTICS patient_count = ROW_COUNT;
    
    -- Supprimer les cabinets démo expirés
    DELETE FROM "Cabinet" 
    WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
    GET DIAGNOSTICS cabinet_count = ROW_COUNT;
    
    -- Supprimer les ostéopathes démo expirés
    DELETE FROM "Osteopath" 
    WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
    GET DIAGNOSTICS osteopath_count = ROW_COUNT;
    
    -- Supprimer les utilisateurs démo dont l'email commence par "demo-"
    -- et qui ont été créés il y a plus de 30 minutes
    DELETE FROM "User" 
    WHERE email LIKE 'demo-%@patienthub.com' 
    AND created_at < (NOW() - INTERVAL '30 minutes');
    GET DIAGNOSTICS user_count = ROW_COUNT;
    
    total_deleted := user_count + patient_count + appointment_count + invoice_count + cabinet_count + osteopath_count;
    
    -- Log de l'activité
    RAISE NOTICE 'Nettoyage démo: % utilisateurs, % patients, % RDV, % factures, % cabinets, % ostéopathes supprimés', 
        user_count, patient_count, appointment_count, invoice_count, cabinet_count, osteopath_count;
    
    RETURN QUERY SELECT total_deleted;
END;
$$;