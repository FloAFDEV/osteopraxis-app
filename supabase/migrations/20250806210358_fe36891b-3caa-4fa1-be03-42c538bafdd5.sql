
-- 1. Enhance RLS policies with better access control
-- Update Patient RLS policy to be more restrictive
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON "Patient";

-- Create more specific policies for Patient table
CREATE POLICY "osteopath_strict_patient_management" ON "Patient"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o 
    WHERE o."authId" = auth.uid() 
    AND (o.id = "Patient"."osteopathId" OR 
         "Patient"."cabinetId" IN (
           SELECT oc.cabinet_id FROM osteopath_cabinet oc 
           WHERE oc.osteopath_id = o.id
         ))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o 
    WHERE o."authId" = auth.uid() 
    AND (o.id = "Patient"."osteopathId" OR 
         "Patient"."cabinetId" IN (
           SELECT oc.cabinet_id FROM osteopath_cabinet oc 
           WHERE oc.osteopath_id = o.id
         ))
  )
);

-- 2. Add audit triggers for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, 
      record_id, 
      action, 
      old_values, 
      user_id,
      ip_address,
      user_agent
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id::text,
      TG_OP,
      to_jsonb(OLD),
      auth.uid(),
      COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')::inet,
      current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, 
      record_id, 
      action, 
      old_values, 
      new_values, 
      user_id,
      ip_address,
      user_agent
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id::text,
      TG_OP,
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')::inet,
      current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, 
      record_id, 
      action, 
      new_values, 
      user_id,
      ip_address,
      user_agent
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id::text,
      TG_OP,
      to_jsonb(NEW),
      auth.uid(),
      COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')::inet,
      current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_patient_changes
  AFTER INSERT OR UPDATE OR DELETE ON "Patient"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_appointment_changes
  AFTER INSERT OR UPDATE OR DELETE ON "Appointment"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_invoice_changes
  AFTER INSERT OR UPDATE OR DELETE ON "Invoice"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 3. Enhanced data validation functions
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.validate_phone(phone text)
RETURNS boolean AS $$
BEGIN
  -- Basic phone validation for French numbers
  RETURN phone ~ '^(\+33|0)[1-9](\d{8})$' OR phone ~ '^(\+33|0)[1-9](\s?\d{2}){4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Rate limiting table for API calls
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can view rate limit data
CREATE POLICY "admin_rate_limits_access" ON public.api_rate_limits
FOR ALL
USING (is_admin());

-- 5. Enhanced admin verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean AS $$
DECLARE
  user_role text;
  is_active boolean;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role and active status
  SELECT u.role::text, u.is_active
  INTO user_role, is_active
  FROM public."User" u
  WHERE u.auth_id = auth.uid() OR u.id = auth.uid();
  
  -- Return true only if user is admin and active
  RETURN user_role = 'ADMIN' AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Get current request count in the window
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start >= window_start_time;
  
  -- If under limit, record the request
  IF current_count < p_max_requests THEN
    INSERT INTO public.api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, now())
    ON CONFLICT (user_id, endpoint) 
    DO UPDATE SET 
      request_count = api_rate_limits.request_count + 1,
      window_start = CASE 
        WHEN api_rate_limits.window_start < window_start_time 
        THEN now() 
        ELSE api_rate_limits.window_start 
      END;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add unique constraint to prevent duplicate rate limit entries
ALTER TABLE public.api_rate_limits 
ADD CONSTRAINT unique_user_endpoint UNIQUE (user_id, endpoint);

-- 9. Update existing security functions to be more secure
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id_secure()
RETURNS integer AS $$
DECLARE
    osteopath_id INTEGER;
    user_active BOOLEAN;
BEGIN
    -- Verify user is authenticated and active
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check if user is active
    SELECT u.is_active INTO user_active
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL;
    
    IF user_active IS NOT TRUE THEN
        RETURN NULL;
    END IF;
    
    -- Get osteopath ID with additional validation
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL
    AND u.is_active = true;
    
    -- Double-check osteopath exists and is valid
    IF osteopath_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public."Osteopath" o
            WHERE o.id = osteopath_id
            AND (o."authId" = auth.uid() OR o."userId" = auth.uid())
        ) THEN
            RETURN NULL;
        END IF;
    END IF;
    
    RETURN osteopath_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 10. Create a scheduled job to clean up old logs and rate limits
CREATE OR REPLACE FUNCTION public.scheduled_cleanup()
RETURNS void AS $$
BEGIN
    -- Clean up old audit logs (keep only 90 days)
    DELETE FROM audit_logs 
    WHERE created_at < now() - interval '90 days';
    
    -- Clean up old rate limits
    PERFORM public.cleanup_rate_limits();
    
    -- Log cleanup action
    INSERT INTO audit_logs (
        table_name, 
        record_id, 
        action, 
        new_values
    ) VALUES (
        'system',
        'cleanup',
        'SCHEDULED_CLEANUP',
        jsonb_build_object(
            'timestamp', now(),
            'performed_by', 'system'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
