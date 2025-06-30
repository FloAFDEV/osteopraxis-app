
-- Create table for storing Google API keys per osteopath
CREATE TABLE IF NOT EXISTS google_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  osteopath_id integer NOT NULL,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint
ALTER TABLE google_api_keys ADD CONSTRAINT google_api_keys_osteopath_id_unique UNIQUE (osteopath_id);

-- Create RLS policies
ALTER TABLE google_api_keys ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to google_calendar_events for patient matching
ALTER TABLE google_calendar_events ADD COLUMN IF NOT EXISTS patient_id integer;
