
-- Vérification préliminaire : voir combien de factures seront modifiées
SELECT COUNT(*) FROM "Invoice" WHERE "osteopathId" IS NULL OR "cabinetId" IS NULL;

-- Met à jour TOUTES les factures sans ostéopathe ou sans cabinet avec l’id 1 pour chacun
UPDATE "Invoice"
SET "osteopathId" = 1, "cabinetId" = 1
WHERE "osteopathId" IS NULL OR "cabinetId" IS NULL;
