-- Ajout des champs manquants à la table Cabinet pour améliorer la gestion des données

-- Ajouter les colonnes manquantes avec des valeurs par défaut appropriées
ALTER TABLE public."Cabinet" 
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "postalCode" TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'France',
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS bic TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Créer des index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS idx_cabinet_city ON public."Cabinet"(city);
CREATE INDEX IF NOT EXISTS idx_cabinet_postal_code ON public."Cabinet"("postalCode");
CREATE INDEX IF NOT EXISTS idx_cabinet_siret ON public."Cabinet"(siret);

-- Ajouter un commentaire pour documenter les champs
COMMENT ON COLUMN public."Cabinet".city IS 'Ville du cabinet';
COMMENT ON COLUMN public."Cabinet"."postalCode" IS 'Code postal du cabinet';
COMMENT ON COLUMN public."Cabinet".country IS 'Pays du cabinet (par défaut: France)';
COMMENT ON COLUMN public."Cabinet".siret IS 'Numéro SIRET du cabinet';
COMMENT ON COLUMN public."Cabinet".iban IS 'IBAN pour les paiements';
COMMENT ON COLUMN public."Cabinet".bic IS 'BIC/SWIFT pour les paiements internationaux';
COMMENT ON COLUMN public."Cabinet".website IS 'Site web du cabinet';