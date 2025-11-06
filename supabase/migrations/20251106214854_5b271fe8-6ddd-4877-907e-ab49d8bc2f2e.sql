-- Ajout du système de plans tarifaires (Light / Full)
-- Permet aux utilisateurs de choisir entre un plan simplifié (patients uniquement) 
-- ou un plan complet (patients + RDV + factures + planning)

-- Créer le type ENUM pour les plans
CREATE TYPE subscription_tier AS ENUM ('light', 'full', 'pro');

-- Ajouter le champ plan à la table Osteopath
ALTER TABLE public."Osteopath" 
ADD COLUMN IF NOT EXISTS plan subscription_tier DEFAULT 'light';

-- Créer un index pour optimiser les requêtes par plan
CREATE INDEX IF NOT EXISTS idx_osteopath_plan ON public."Osteopath"(plan);

-- Ajouter des commentaires pour documenter
COMMENT ON COLUMN public."Osteopath".plan IS 'Plan tarifaire de l''ostéopathe: light (patients uniquement), full (complet), pro (avancé avec équipe)';
COMMENT ON TYPE subscription_tier IS 'Niveaux de plans tarifaires disponibles pour les ostéopathes';

-- Fonction helper pour obtenir le plan de l'ostéopathe actuel
CREATE OR REPLACE FUNCTION public.get_current_osteopath_plan()
RETURNS subscription_tier
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    osteopath_plan subscription_tier;
BEGIN
    -- Vérifier l'authentification
    IF auth.uid() IS NULL THEN
        RETURN 'light'; -- Par défaut pour les non-authentifiés
    END IF;
    
    -- Récupérer le plan de l'ostéopathe
    SELECT o.plan INTO osteopath_plan
    FROM public."Osteopath" o
    WHERE o."authId" = auth.uid() OR o."userId" = auth.uid();
    
    -- Retourner light par défaut si non trouvé
    RETURN COALESCE(osteopath_plan, 'light');
END;
$function$;

-- Commentaire pour la fonction
COMMENT ON FUNCTION public.get_current_osteopath_plan() IS 'Retourne le plan tarifaire de l''ostéopathe authentifié actuel';