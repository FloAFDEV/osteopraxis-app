
-- Corriger la table Osteopath pour avoir la colonne authId utilisée dans les politiques RLS
ALTER TABLE "Osteopath" ADD COLUMN IF NOT EXISTS "authId" uuid;

-- Migrer les données existantes de userId vers authId si nécessaire
UPDATE "Osteopath" SET "authId" = "userId" WHERE "authId" IS NULL;

-- Rendre authId obligatoire maintenant qu'il est peuplé
ALTER TABLE "Osteopath" ALTER COLUMN "authId" SET NOT NULL;

-- Créer un index pour les performances sur authId
CREATE INDEX IF NOT EXISTS "idx_osteopath_authId" ON "Osteopath" ("authId");
