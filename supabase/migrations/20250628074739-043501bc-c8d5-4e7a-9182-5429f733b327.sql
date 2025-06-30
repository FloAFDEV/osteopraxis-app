
-- Drop existing tables if they exist (for clean recreation)
DROP TABLE IF EXISTS public.google_calendar_events CASCADE;
DROP TABLE IF EXISTS public.google_calendar_tokens CASCADE;
DROP FUNCTION IF EXISTS update_google_calendar_tokens_updated_at() CASCADE;

-- Create table to store Google Calendar integration tokens
CREATE TABLE public.google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(osteopath_id)
);

-- Enable Row Level Security
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for osteopaths to manage their own tokens
CREATE POLICY "osteopath_own_tokens" ON public.google_calendar_tokens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public."Osteopath" o 
    WHERE o.id = osteopath_id 
    AND o."authId" = auth.uid()
  )
);

-- Create table to cache Google Calendar events
CREATE TABLE public.google_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'confirmed',
  last_modified TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(osteopath_id, google_event_id)
);

-- Create index for performance on queries by date range
CREATE INDEX idx_google_calendar_events_osteopath_date 
ON public.google_calendar_events(osteopath_id, start_time, end_time);

-- Create index for event status filtering
CREATE INDEX idx_google_calendar_events_status 
ON public.google_calendar_events(osteopath_id, status);

-- Enable Row Level Security
ALTER TABLE public.google_calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policy for osteopaths to view their own calendar events
CREATE POLICY "osteopath_own_calendar_events" ON public.google_calendar_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Osteopath" o 
    WHERE o.id = osteopath_id 
    AND o."authId" = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_google_calendar_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps on tokens table
CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_calendar_tokens_updated_at();

-- Create function to clean up old events (older than 3 months)
CREATE OR REPLACE FUNCTION cleanup_old_google_calendar_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.google_calendar_events 
  WHERE end_time < NOW() - INTERVAL '3 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if tokens are expired or will expire soon (within 5 minutes)
CREATE OR REPLACE FUNCTION are_google_tokens_expired(p_osteopath_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  token_expires_at TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO token_expires_at
  FROM public.google_calendar_tokens
  WHERE osteopath_id = p_osteopath_id;
  
  -- Return true if no tokens found or if tokens expire within 5 minutes
  RETURN (token_expires_at IS NULL OR token_expires_at <= NOW() + INTERVAL '5 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
