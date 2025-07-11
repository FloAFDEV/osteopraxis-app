-- Nettoyer les doublons et garder seulement les plans les plus récents
DELETE FROM public.subscription_plans 
WHERE created_at < '2025-07-11 18:00:00';

-- Ajouter les champs manquants à la table subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS plan_code TEXT,
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS max_practitioners INTEGER DEFAULT 1;

-- Mettre à jour les plans existants avec tous les champs manquants
UPDATE public.subscription_plans 
SET 
  plan_code = 'free',
  max_practitioners = 1
WHERE name = 'Gratuit' AND plan_code IS NULL;

UPDATE public.subscription_plans 
SET 
  plan_code = 'essential',
  max_practitioners = 1
WHERE name = 'Essentiel' AND plan_code IS NULL;

UPDATE public.subscription_plans 
SET 
  plan_code = 'pro',
  max_practitioners = 2
WHERE name = 'Pro' AND plan_code IS NULL;

UPDATE public.subscription_plans 
SET 
  plan_code = 'premium',
  max_practitioners = 999 -- illimité
WHERE name = 'Premium' AND plan_code IS NULL;

-- Créer l'index unique pour plan_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_plans_plan_code 
ON public.subscription_plans (plan_code);

-- Mettre à jour la fonction can_perform_action pour inclure max_practitioners
CREATE OR REPLACE FUNCTION public.can_perform_action(user_uuid uuid, action_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  limits RECORD;
  current_count INTEGER;
  max_practitioners_limit INTEGER;
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
      WHERE o."authId" = user_uuid AND p.deleted_at IS NULL;
      
      RETURN current_count < limits.max_patients;
      
    WHEN 'create_cabinet' THEN
      -- Count current cabinets
      SELECT COUNT(*) INTO current_count
      FROM public."Cabinet" c
      JOIN public."Osteopath" o ON o.id = c."osteopathId"
      WHERE o."authId" = user_uuid;
      
      RETURN current_count < limits.max_cabinets;
      
    WHEN 'create_practitioner' THEN
      -- Count current practitioners/osteopaths for this user
      SELECT COUNT(*) INTO current_count
      FROM public."Osteopath" o
      WHERE o."authId" = user_uuid;
      
      -- Get max_practitioners from subscription plan
      SELECT sp.max_practitioners INTO max_practitioners_limit
      FROM public.subscription_plans sp 
      WHERE sp.name = limits.subscription_tier;
      
      -- Check if unlimited or within limits
      RETURN (limits.features->>'unlimited_practitioners')::BOOLEAN = true 
             OR current_count < COALESCE(max_practitioners_limit, 1);
      
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
$function$;