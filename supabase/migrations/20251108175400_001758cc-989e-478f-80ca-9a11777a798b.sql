-- ============================================
-- CORRECTION ERREUR CRITIQUE: AUTH USERS EXPOSED
-- Suppression de user_roles_view et remplacement par une fonction sécurisée
-- ============================================

-- 1. Supprimer la vue problématique qui expose auth.users
DROP VIEW IF EXISTS public.user_roles_view CASCADE;

-- 2. Créer une fonction SECURITY DEFINER sécurisée pour remplacer la vue
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  role app_role,
  role_assigned_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Seul l'utilisateur peut voir ses propres rôles
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    ur.role,
    ur.created_at as role_assigned_at
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE au.id = auth.uid();
END;
$$;

-- 3. Documentation
COMMENT ON FUNCTION public.get_current_user_roles() IS 
'Retourne les rôles de l''utilisateur connecté uniquement. Remplace user_roles_view pour corriger l''erreur AUTH USERS EXPOSED du linter Supabase. Cette fonction utilise SECURITY DEFINER avec search_path fixé pour éviter les failles de sécurité.';