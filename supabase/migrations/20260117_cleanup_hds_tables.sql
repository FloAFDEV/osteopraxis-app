-- ⚠️ MIGRATION CRITIQUE - Nettoyage tables HDS de Supabase
-- Date: 17 Janvier 2026
-- Objectif: Supprimer toutes les tables contenant des données HDS
-- Raison: Architecture hybride - données HDS doivent être 100% locales

-- ===========================================================================
-- ÉTAPE 1 - Supprimer les triggers d'audit pour tables HDS
-- ===========================================================================

-- Désactiver l'audit pour les tables HDS (éviter logs sensibles)
DROP TRIGGER IF EXISTS audit_patient_changes ON "Patient";
DROP TRIGGER IF EXISTS audit_appointment_changes ON "Appointment";
DROP TRIGGER IF EXISTS audit_consultation_changes ON "Consultation";
DROP TRIGGER IF EXISTS audit_medical_document_changes ON "MedicalDocument";
DROP TRIGGER IF EXISTS audit_treatment_history_changes ON "TreatmentHistory";
DROP TRIGGER IF EXISTS audit_invoice_changes ON "Invoice";

-- ===========================================================================
-- ÉTAPE 2 - Supprimer les tables HDS
-- ===========================================================================

-- Supprimer TreatmentHistory (historique traitements)
DROP TABLE IF EXISTS "TreatmentHistory" CASCADE;

-- Supprimer MedicalDocument (documents médicaux)
DROP TABLE IF EXISTS "MedicalDocument" CASCADE;

-- Supprimer Consultation (notes consultations)
DROP TABLE IF EXISTS "Consultation" CASCADE;

-- Supprimer Invoice (factures - lié aux patients donc HDS)
DROP TABLE IF EXISTS "Invoice" CASCADE;

-- Supprimer Appointment (rendez-vous)
DROP TABLE IF EXISTS "Appointment" CASCADE;

-- Supprimer Patient (données patients - CRITIQUE HDS)
DROP TABLE IF EXISTS "Patient" CASCADE;

-- ===========================================================================
-- ÉTAPE 3 - Nettoyer les audit_logs existants pour données HDS
-- ===========================================================================

-- Supprimer tous les logs d'audit concernant les tables HDS
DELETE FROM audit_logs WHERE table_name IN (
  'Patient',
  'Appointment',
  'Consultation',
  'MedicalDocument',
  'TreatmentHistory',
  'Invoice'
);

-- ===========================================================================
-- ÉTAPE 4 - Anonymiser les audit_logs pour les autres tables
-- ===========================================================================

-- Modifier la fonction d'audit pour hasher les record_id
-- (Éviter corrélation indirecte via IDs)

-- Créer nouvelle colonne pour hash si n'existe pas
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS record_id_hash TEXT;

-- Créer nouvelle fonction d'audit anonymisée
CREATE OR REPLACE FUNCTION audit_log_changes_anonymized()
RETURNS TRIGGER AS $$
BEGIN
  -- Logger uniquement pour tables NON-HDS
  IF TG_TABLE_NAME NOT IN ('Patient', 'Appointment', 'Consultation', 'Invoice', 'MedicalDocument', 'TreatmentHistory') THEN
    INSERT INTO audit_logs (
      action,
      table_name,
      record_id_hash, -- Hash au lieu d'ID direct
      user_id,
      ip_address,
      user_agent,
      created_at
    ) VALUES (
      TG_OP,
      TG_TABLE_NAME,
      -- Hash SHA-256 de l'ID (anonymisation)
      encode(digest(COALESCE(NEW.id::text, OLD.id::text), 'sha256'), 'hex'),
      auth.uid(),
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      current_setting('request.headers', true)::json->>'user-agent',
      NOW()
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le nouveau trigger aux tables NON-HDS restantes
-- (Cabinet, Osteopath, User, etc.)

-- Cabinet
DROP TRIGGER IF EXISTS audit_cabinet_changes ON "Cabinet";
CREATE TRIGGER audit_cabinet_changes
  AFTER INSERT OR UPDATE OR DELETE ON "Cabinet"
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes_anonymized();

-- Osteopath
DROP TRIGGER IF EXISTS audit_osteopath_changes ON "Osteopath";
CREATE TRIGGER audit_osteopath_changes
  AFTER INSERT OR UPDATE OR DELETE ON "Osteopath"
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes_anonymized();

-- User
DROP TRIGGER IF EXISTS audit_user_changes ON "User";
CREATE TRIGGER audit_user_changes
  AFTER INSERT OR UPDATE OR DELETE ON "User"
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes_anonymized();

-- ===========================================================================
-- ÉTAPE 5 - Vérification finale
-- ===========================================================================

-- Vérifier qu'aucune table HDS n'existe
DO $$
DECLARE
  hds_tables TEXT[] := ARRAY['Patient', 'Appointment', 'Consultation', 'Invoice', 'MedicalDocument', 'TreatmentHistory'];
  table_name TEXT;
  table_exists BOOLEAN;
BEGIN
  FOREACH table_name IN ARRAY hds_tables
  LOOP
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = table_name
    ) INTO table_exists;

    IF table_exists THEN
      RAISE EXCEPTION 'ERREUR: Table HDS % existe encore!', table_name;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Toutes les tables HDS ont été supprimées avec succès';
END $$;

-- Vérifier que les triggers HDS ont été supprimés
SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('Patient', 'Appointment', 'Consultation', 'Invoice', 'MedicalDocument', 'TreatmentHistory');
-- Doit retourner 0 ligne

-- ===========================================================================
-- NOTES IMPORTANTES
-- ===========================================================================

-- ⚠️ CETTE MIGRATION EST IRRÉVERSIBLE
-- ⚠️ Toutes les données HDS en base Supabase seront DÉFINITIVEMENT supprimées
-- ⚠️ S'assurer que les données ont été migrées vers le stockage local avant d'exécuter

-- ✅ Après cette migration :
--    - Aucune donnée HDS dans Supabase
--    - Audit_logs anonymisé (hash au lieu d'IDs)
--    - Architecture hybride 100% conforme
--    - Pas d'obligation hébergement HDS certifié

-- 📝 Tables conservées (NON-HDS) :
--    - auth.users (Supabase Auth)
--    - User (profils utilisateurs)
--    - Osteopath (profils professionnels)
--    - Cabinet (informations cabinets)
--    - osteopath_cabinet (relations)
--    - CabinetInvitation (invitations)
--    - google_calendar_tokens (OAuth - à vérifier anonymisation)
--    - subscription_status (Stripe)
--    - audit_logs (anonymisé via hash)
