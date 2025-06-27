
-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  max_patients INTEGER,
  max_cabinets INTEGER,
  features JSONB,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, max_patients, max_cabinets, features, stripe_price_id_monthly, stripe_price_id_yearly) VALUES
('Gratuit', 0.00, 0.00, 5, 1, '{"invoices": false, "advanced_stats": false, "export": false}', null, null),
('Professionnel', 29.99, 299.99, 100, 3, '{"invoices": true, "advanced_stats": true, "export": true, "priority_support": false}', 'price_professional_monthly', 'price_professional_yearly'),
('Premium', 59.99, 599.99, 500, 10, '{"invoices": true, "advanced_stats": true, "export": true, "priority_support": true, "multi_osteopath": true}', 'price_premium_monthly', 'price_premium_yearly');

-- Create usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on usage tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for usage tracking
CREATE POLICY "select_own_usage" ON public.usage_tracking
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "insert_own_usage" ON public.usage_tracking
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create function to get current subscription limits
CREATE OR REPLACE FUNCTION public.get_subscription_limits(user_uuid UUID)
RETURNS TABLE(
  max_patients INTEGER,
  max_cabinets INTEGER,
  features JSONB,
  subscription_tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record RECORD;
  plan_record RECORD;
BEGIN
  -- Get user's subscription
  SELECT * INTO sub_record
  FROM public.subscribers
  WHERE user_id = user_uuid;
  
  -- If no subscription or not subscribed, return free plan limits
  IF sub_record IS NULL OR NOT sub_record.subscribed THEN
    SELECT * INTO plan_record
    FROM public.subscription_plans
    WHERE name = 'Gratuit';
    
    RETURN QUERY SELECT 
      plan_record.max_patients,
      plan_record.max_cabinets,
      plan_record.features,
      'Gratuit'::TEXT;
    RETURN;
  END IF;
  
  -- Get plan details based on subscription tier
  SELECT * INTO plan_record
  FROM public.subscription_plans
  WHERE name = sub_record.subscription_tier;
  
  -- If plan not found, default to free
  IF plan_record IS NULL THEN
    SELECT * INTO plan_record
    FROM public.subscription_plans
    WHERE name = 'Gratuit';
  END IF;
  
  RETURN QUERY SELECT 
    plan_record.max_patients,
    plan_record.max_cabinets,
    plan_record.features,
    sub_record.subscription_tier;
END;
$$;

-- Create function to check if user can perform action
CREATE OR REPLACE FUNCTION public.can_perform_action(
  user_uuid UUID,
  action_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  limits RECORD;
  current_count INTEGER;
BEGIN
  -- Get subscription limits
  SELECT * INTO limits
  FROM public.get_subscription_limits(user_uuid);
  
  CASE action_type
    WHEN 'create_patient' THEN
      -- Count current patients
      SELECT COUNT(*) INTO current_count
      FROM public."Patient" p
      JOIN public."Osteopath" o ON o.id = p."osteopathId"
      WHERE o."authId" = user_uuid;
      
      RETURN current_count < limits.max_patients;
      
    WHEN 'create_cabinet' THEN
      -- Count current cabinets
      SELECT COUNT(*) INTO current_count
      FROM public."Cabinet" c
      JOIN public."Osteopath" o ON o.id = c."osteopathId"
      WHERE o."authId" = user_uuid;
      
      RETURN current_count < limits.max_cabinets;
      
    WHEN 'access_invoices' THEN
      RETURN (limits.features->>'invoices')::BOOLEAN;
      
    WHEN 'access_advanced_stats' THEN
      RETURN (limits.features->>'advanced_stats')::BOOLEAN;
      
    WHEN 'export_data' THEN
      RETURN (limits.features->>'export')::BOOLEAN;
      
    ELSE
      RETURN true;
  END CASE;
END;
$$;
