-- Créer une table pour les relations entre patients
CREATE TABLE IF NOT EXISTS patient_relationships (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  related_patient_id INTEGER NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  relationship_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, related_patient_id, relationship_type)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_patient_relationships_patient_id ON patient_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_relationships_related_patient_id ON patient_relationships(related_patient_id);

-- RLS policies
ALTER TABLE patient_relationships ENABLE ROW LEVEL SECURITY;

-- Politique pour les ostéopathes - peuvent gérer les relations de leurs patients
CREATE POLICY "Osteopaths can manage patient relationships" 
ON patient_relationships 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Patient" p 
    WHERE p.id = patient_id 
    AND can_osteopath_access_patient(auth.uid(), p.id)
  )
  AND EXISTS (
    SELECT 1 FROM "Patient" p 
    WHERE p.id = related_patient_id 
    AND can_osteopath_access_patient(auth.uid(), p.id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Patient" p 
    WHERE p.id = patient_id 
    AND can_osteopath_access_patient(auth.uid(), p.id)
  )
  AND EXISTS (
    SELECT 1 FROM "Patient" p 
    WHERE p.id = related_patient_id 
    AND can_osteopath_access_patient(auth.uid(), p.id)
  )
);

-- Politique pour les admins
CREATE POLICY "Admins can manage all patient relationships" 
ON patient_relationships 
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_patient_relationships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_patient_relationships_updated_at
BEFORE UPDATE ON patient_relationships
FOR EACH ROW
EXECUTE FUNCTION update_patient_relationships_updated_at();