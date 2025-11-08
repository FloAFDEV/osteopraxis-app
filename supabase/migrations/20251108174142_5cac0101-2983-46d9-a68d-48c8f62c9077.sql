-- ============================================
-- PHASE 3 : Protection API avec RLS basée sur le plan d'abonnement
-- Empêche les utilisateurs plan 'light' de créer factures/devis
-- ============================================

-- 1️⃣ Supprimer l'ancienne fonction et la recréer avec le bon type
DROP FUNCTION IF EXISTS public.get_current_osteopath_plan();

CREATE OR REPLACE FUNCTION public.get_current_osteopath_plan()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan text;
BEGIN
  -- Récupérer le plan de l'ostéopathe connecté via son userId
  SELECT o.plan::text INTO user_plan
  FROM "Osteopath" o
  WHERE o."userId" = auth.uid()
  LIMIT 1;
  
  -- Si aucun plan trouvé, retourner 'light' par défaut
  RETURN COALESCE(user_plan, 'light');
END;
$$;

-- 2️⃣ RLS Policy : Empêcher les utilisateurs 'light' de créer des factures
CREATE POLICY "plan_light_cannot_create_invoices"
ON "Invoice" FOR INSERT
TO authenticated
WITH CHECK (
  get_current_osteopath_plan() IN ('full', 'pro')
);

-- 3️⃣ RLS Policy : Empêcher les utilisateurs 'light' de créer des devis
CREATE POLICY "plan_light_cannot_create_quotes"
ON "Quote" FOR INSERT
TO authenticated
WITH CHECK (
  get_current_osteopath_plan() IN ('full', 'pro')
);

-- 4️⃣ RLS Policy : Empêcher les utilisateurs 'light' de créer des quote items
CREATE POLICY "plan_light_cannot_create_quote_items"
ON "QuoteItem" FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Quote" q
    WHERE q.id = "QuoteItem"."quoteId"
    AND get_current_osteopath_plan() IN ('full', 'pro')
  )
);

-- 5️⃣ Commentaires pour documentation
COMMENT ON FUNCTION public.get_current_osteopath_plan() IS 
'Retourne le plan d''abonnement (light, full, pro) de l''ostéopathe connecté. Utilisé pour les restrictions RLS basées sur le plan.';

COMMENT ON POLICY "plan_light_cannot_create_invoices" ON "Invoice" IS 
'Restriction RLS : Seuls les utilisateurs avec plan full ou pro peuvent créer des factures. Les utilisateurs light reçoivent une erreur 42501.';

COMMENT ON POLICY "plan_light_cannot_create_quotes" ON "Quote" IS 
'Restriction RLS : Seuls les utilisateurs avec plan full ou pro peuvent créer des devis. Les utilisateurs light reçoivent une erreur 42501.';

COMMENT ON POLICY "plan_light_cannot_create_quote_items" ON "QuoteItem" IS 
'Restriction RLS : Seuls les utilisateurs avec plan full ou pro peuvent créer des items de devis. Vérifie indirectement via le devis parent.';