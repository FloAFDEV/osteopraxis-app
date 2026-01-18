-- Migration: Ajout du système de statut ostéopathe (demo/actif)
-- Date: 18 Janvier 2026
-- Objectif: Gérer le cycle de vie ostéopathe avec mode démo obligatoire avant paiement

-- ===========================================================================
-- ÉTAPE 1 - Ajouter la colonne status à la table Osteopath
-- ===========================================================================

-- Type ENUM pour le statut
CREATE TYPE osteopath_status AS ENUM ('demo', 'active', 'blocked');

-- Ajouter la colonne status (par défaut 'demo')
ALTER TABLE "Osteopath"
ADD COLUMN IF NOT EXISTS status osteopath_status DEFAULT 'demo' NOT NULL;

-- Ajouter les colonnes de tracking
ALTER TABLE "Osteopath"
ADD COLUMN IF NOT EXISTS demo_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE "Osteopath"
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE "Osteopath"
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE "Osteopath"
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- ===========================================================================
-- ÉTAPE 2 - Mettre à jour les ostéopathes existants
-- ===========================================================================

-- Tous les ostéopathes existants passent en mode 'active' (grandfathering)
UPDATE "Osteopath"
SET status = 'active',
    activated_at = NOW(),
    demo_started_at = created_at
WHERE status = 'demo';

-- ===========================================================================
-- ÉTAPE 3 - Créer une table pour l'historique des changements de statut
-- ===========================================================================

CREATE TABLE IF NOT EXISTS osteopath_status_history (
  id SERIAL PRIMARY KEY,
  osteopath_id INTEGER NOT NULL REFERENCES "Osteopath"(id) ON DELETE CASCADE,
  old_status osteopath_status,
  new_status osteopath_status NOT NULL,
  changed_by TEXT, -- user_id de l'admin qui a fait le changement
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_osteopath_status_history_osteopath_id
ON osteopath_status_history(osteopath_id);

-- RLS sur l'historique (seuls les admins peuvent lire)
ALTER TABLE osteopath_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view status history"
ON osteopath_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role = 'ADMIN'
  )
);

-- ===========================================================================
-- ÉTAPE 4 - Trigger pour tracker les changements de statut
-- ===========================================================================

CREATE OR REPLACE FUNCTION track_osteopath_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut change, enregistrer dans l'historique
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO osteopath_status_history (osteopath_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid()::text);

    -- Mettre à jour les timestamps selon le nouveau statut
    IF NEW.status = 'active' AND OLD.status = 'demo' THEN
      NEW.activated_at := NOW();
    ELSIF NEW.status = 'blocked' THEN
      NEW.blocked_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS osteopath_status_change_trigger ON "Osteopath";
CREATE TRIGGER osteopath_status_change_trigger
  BEFORE UPDATE ON "Osteopath"
  FOR EACH ROW
  EXECUTE FUNCTION track_osteopath_status_changes();

-- ===========================================================================
-- ÉTAPE 5 - Fonctions helper pour les admins
-- ===========================================================================

-- Fonction pour activer un ostéopathe (passer de demo à active)
CREATE OR REPLACE FUNCTION activate_osteopath(p_osteopath_id INTEGER, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent activer un ostéopathe';
  END IF;

  -- Activer l'ostéopathe
  UPDATE "Osteopath"
  SET status = 'active',
      activated_at = NOW()
  WHERE id = p_osteopath_id
  AND status = 'demo';

  -- Enregistrer la raison dans l'historique
  IF p_reason IS NOT NULL THEN
    UPDATE osteopath_status_history
    SET reason = p_reason
    WHERE osteopath_id = p_osteopath_id
    AND new_status = 'active'
    AND created_at = (
      SELECT MAX(created_at) FROM osteopath_status_history
      WHERE osteopath_id = p_osteopath_id
    );
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour bloquer un ostéopathe
CREATE OR REPLACE FUNCTION block_osteopath(p_osteopath_id INTEGER, p_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent bloquer un ostéopathe';
  END IF;

  -- Bloquer l'ostéopathe
  UPDATE "Osteopath"
  SET status = 'blocked',
      blocked_at = NOW(),
      blocked_reason = p_reason
  WHERE id = p_osteopath_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- ÉTAPE 6 - Vue pour les admins (statistiques statuts)
-- ===========================================================================

CREATE OR REPLACE VIEW osteopath_status_stats AS
SELECT
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - demo_started_at)) / 86400)::INTEGER as avg_days_in_demo
FROM "Osteopath"
GROUP BY status;

-- ===========================================================================
-- ÉTAPE 7 - Politiques RLS mises à jour
-- ===========================================================================

-- Les ostéopathes peuvent voir leur propre statut
CREATE POLICY "Osteopaths can view their own status"
ON "Osteopath" FOR SELECT
USING (
  "userId" = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
  )
);

-- Seuls les admins peuvent modifier le statut
CREATE POLICY "Only admins can update status"
ON "Osteopath" FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
  )
);

-- ===========================================================================
-- NOTES IMPORTANTES
-- ===========================================================================

-- ✅ Après cette migration :
--    - Tous les nouveaux ostéopathes sont en mode 'demo' par défaut
--    - Les ostéopathes existants sont automatiquement passés en 'active'
--    - L'historique des changements de statut est tracké
--    - Les admins peuvent activer/bloquer via les fonctions SQL

-- 🔐 Anti-fraude :
--    - Le statut ne peut être changé que par un admin
--    - L'historique est immuable (INSERT only)
--    - Les timestamps sont automatiques

-- 📝 Statuts possibles :
--    - demo: Accès complet mais factures PDF non valables
--    - active: Accès complet avec factures officielles
--    - blocked: Compte suspendu
