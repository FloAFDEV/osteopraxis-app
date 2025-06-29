
-- Créer la table pour stocker les clés API Google par ostéopathe
CREATE TABLE IF NOT EXISTS google_api_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    osteopath_id integer NOT NULL REFERENCES "Osteopath"(id) ON DELETE CASCADE,
    client_id text NOT NULL,
    client_secret text, -- Peut être null temporairement
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Contrainte d'unicité : un seul enregistrement par ostéopathe
    UNIQUE(osteopath_id)
);

-- Index pour les requêtes par ostéopathe
CREATE INDEX IF NOT EXISTS idx_google_api_keys_osteopath_id ON google_api_keys(osteopath_id);

-- RLS (Row Level Security)
ALTER TABLE google_api_keys ENABLE ROW LEVEL SECURITY;

-- Politique RLS : chaque ostéopathe ne peut voir que ses propres clés
CREATE POLICY "Osteopaths can only access their own API keys" ON google_api_keys
    FOR ALL USING (
        osteopath_id IN (
            SELECT id FROM "Osteopath" WHERE "userId" = auth.uid()
        )
    );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_google_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_google_api_keys_updated_at
    BEFORE UPDATE ON google_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_google_api_keys_updated_at();
