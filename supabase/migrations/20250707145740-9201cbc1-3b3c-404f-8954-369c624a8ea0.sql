-- Ajouter les nouveaux champs pour le lien de parenté et contraception complémentaire
ALTER TABLE "Patient" 
ADD COLUMN relationship_type TEXT,
ADD COLUMN relationship_other TEXT,
ADD COLUMN contraception_notes TEXT;