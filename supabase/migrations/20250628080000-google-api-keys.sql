
-- Create table to store Google API keys for each osteopath
CREATE TABLE public.google_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(osteopath_id)
);

-- Enable Row Level Security
ALTER TABLE public.google_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for osteopaths to manage their own API keys
CREATE POLICY "osteopath_own_api_keys" ON public.google_api_keys
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public."Osteopath" o 
    WHERE o.id = osteopath_id 
    AND o."authId" = auth.uid()
  )
);

-- Add patient association to google calendar events for invoicing
ALTER TABLE public.google_calendar_events 
ADD COLUMN patient_id INTEGER REFERENCES public."Patient"(id) ON DELETE SET NULL;

-- Create index for patient lookup
CREATE INDEX idx_google_calendar_events_patient 
ON public.google_calendar_events(osteopath_id, patient_id);
