
-- Ajouter les 4 nouvelles colonnes pour les sections cliniques dans la table Patient
ALTER TABLE "Patient"
ADD COLUMN IF NOT EXISTS diagnosis text,
ADD COLUMN IF NOT EXISTS medical_examination text,
ADD COLUMN IF NOT EXISTS treatment_plan text,
ADD COLUMN IF NOT EXISTS consultation_conclusion text;
