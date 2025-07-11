-- Création des tables pour le SaaS avec Stripe
-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC,
  max_patients INTEGER,
  max_cabinets INTEGER,
  max_practitioners INTEGER,
  features JSONB,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS public.subscribers (
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

-- Table de tracking d'usage
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies pour subscription_plans (lecture publique)
CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans
FOR SELECT USING (is_active = true);

-- Policies pour subscribers (accès utilisateur)
CREATE POLICY "subscribers_own_access" ON public.subscribers
FOR ALL USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "subscribers_insert" ON public.subscribers
FOR INSERT WITH CHECK (true);

CREATE POLICY "subscribers_update" ON public.subscribers
FOR UPDATE USING (true);

-- Policies pour usage_tracking
CREATE POLICY "usage_tracking_own_access" ON public.usage_tracking
FOR ALL USING (user_id = auth.uid());

-- Policies admin
CREATE POLICY "admin_full_access_plans" ON public.subscription_plans
FOR ALL USING (is_admin());

CREATE POLICY "admin_full_access_subscribers" ON public.subscribers
FOR ALL USING (is_admin());

CREATE POLICY "admin_full_access_usage" ON public.usage_tracking
FOR ALL USING (is_admin());

-- Insérer les plans de base
INSERT INTO public.subscription_plans (name, price_monthly, max_patients, max_cabinets, max_practitioners, features) VALUES
('Gratuit', 0, 50, 1, 1, '{"invoices": false, "advanced_stats": false, "export": false}'),
('Essentiel', 9, 500, 1, 1, '{"invoices": true, "advanced_stats": false, "export": true}'),
('Pro', 16, 1000, 2, 2, '{"invoices": true, "advanced_stats": true, "export": true}'),
('Premium', 34, 3000, 5, -1, '{"invoices": true, "advanced_stats": true, "export": true, "unlimited_practitioners": true}');

-- Fonction pour vérifier les limites d'abonnement
CREATE OR REPLACE FUNCTION public.get_subscription_limits(user_uuid UUID)
RETURNS TABLE(max_patients INTEGER, max_cabinets INTEGER, features JSONB, subscription_tier TEXT)
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

-- Fonction pour vérifier si une action est autorisée
CREATE OR REPLACE FUNCTION public.can_perform_action(user_uuid UUID, action_type TEXT)
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