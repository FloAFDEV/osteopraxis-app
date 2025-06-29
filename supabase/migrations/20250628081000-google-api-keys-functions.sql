
-- Functions to manage Google API keys securely

-- Function to check if an osteopath has API keys configured
CREATE OR REPLACE FUNCTION check_google_api_keys(p_osteopath_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'client_id', client_id,
    'has_secret', CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN true ELSE false END
  )
  INTO result
  FROM public.google_api_keys
  WHERE osteopath_id = p_osteopath_id;
  
  RETURN result;
END;
$$;

-- Function to save Google API keys
CREATE OR REPLACE FUNCTION save_google_api_keys(
  p_osteopath_id INTEGER,
  p_client_id TEXT,
  p_client_secret TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.google_api_keys (osteopath_id, client_id, client_secret)
  VALUES (p_osteopath_id, p_client_id, p_client_secret)
  ON CONFLICT (osteopath_id)
  DO UPDATE SET
    client_id = EXCLUDED.client_id,
    client_secret = CASE 
      WHEN p_client_secret != '' THEN EXCLUDED.client_secret
      ELSE google_api_keys.client_secret
    END,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Function to delete Google API keys
CREATE OR REPLACE FUNCTION delete_google_api_keys(p_osteopath_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.google_api_keys WHERE osteopath_id = p_osteopath_id;
  DELETE FROM public.google_calendar_tokens WHERE osteopath_id = p_osteopath_id;
  
  RETURN true;
END;
$$;
