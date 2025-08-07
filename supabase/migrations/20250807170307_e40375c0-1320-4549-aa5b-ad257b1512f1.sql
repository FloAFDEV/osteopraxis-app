-- Migration pour améliorer l'admin avec gestion des abonnements et analytics

-- Table subscribers pour la gestion des abonnements
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table subscription_plans pour définir les plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  max_patients INTEGER,
  max_cabinets INTEGER,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table admin_notifications pour les alertes admin
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'trial_expiring', 'user_inactive', 'suspicious_login', 'system_alert'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  related_user_id UUID,
  related_data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Table user_activity_logs pour traquer l'activité
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table business_metrics pour les KPIs
CREATE TABLE IF NOT EXISTS public.business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2),
  metric_type TEXT NOT NULL, -- 'revenue', 'users', 'conversions', etc.
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table system_alerts pour les alertes système
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'performance', 'security', 'maintenance', 'error'
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS pour toutes les nouvelles tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour subscribers
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Admins can manage all subscriptions" ON public.subscribers
FOR ALL USING (is_admin());

-- Politiques RLS pour subscription_plans
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
FOR ALL USING (is_admin());

-- Politiques RLS pour admin_notifications
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications
FOR ALL USING (is_admin());

-- Politiques RLS pour user_activity_logs
CREATE POLICY "Users can view their own activity" ON public.user_activity_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON public.user_activity_logs
FOR ALL USING (is_admin());

-- Politiques RLS pour business_metrics
CREATE POLICY "Admins can manage metrics" ON public.business_metrics
FOR ALL USING (is_admin());

-- Politiques RLS pour system_alerts
CREATE POLICY "Admins can manage alerts" ON public.system_alerts
FOR ALL USING (is_admin());

-- Insérer les plans de base
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, max_patients, max_cabinets, features) VALUES
('Gratuit', 0, 0, 50, 1, '{"export": false, "analytics": false, "priority_support": false}'),
('Premium', 29.99, 299.99, 500, 5, '{"export": true, "analytics": true, "priority_support": true}'),
('Entreprise', 99.99, 999.99, -1, -1, '{"export": true, "analytics": true, "priority_support": true, "custom_branding": true}')
ON CONFLICT (name) DO NOTHING;

-- Trigger pour mettre à jour updated_at sur subscribers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();