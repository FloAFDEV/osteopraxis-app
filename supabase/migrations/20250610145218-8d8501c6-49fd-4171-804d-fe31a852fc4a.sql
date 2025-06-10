
-- Ajouter les contraintes de clés étrangères pour la table Quote seulement si elles n'existent pas
DO $$ 
BEGIN
    -- Vérifier et ajouter la contrainte Quote_patientId_fkey
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Quote_patientId_fkey' 
        AND table_name = 'Quote'
    ) THEN
        ALTER TABLE "Quote" 
        ADD CONSTRAINT "Quote_patientId_fkey" 
        FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE;
    END IF;

    -- Vérifier et ajouter la contrainte Quote_osteopathId_fkey
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Quote_osteopathId_fkey' 
        AND table_name = 'Quote'
    ) THEN
        ALTER TABLE "Quote" 
        ADD CONSTRAINT "Quote_osteopathId_fkey" 
        FOREIGN KEY ("osteopathId") REFERENCES "Osteopath"("id") ON DELETE CASCADE;
    END IF;

    -- Vérifier et ajouter la contrainte Quote_cabinetId_fkey
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Quote_cabinetId_fkey' 
        AND table_name = 'Quote'
    ) THEN
        ALTER TABLE "Quote" 
        ADD CONSTRAINT "Quote_cabinetId_fkey" 
        FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE SET NULL;
    END IF;
END $$;
