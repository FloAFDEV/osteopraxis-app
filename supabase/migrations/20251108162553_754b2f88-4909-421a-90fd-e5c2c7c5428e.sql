-- ================================
-- PHASE 2: SÉCURISATION ADMIN
-- Migration user_roles avec protection privilèges
-- ================================

-- 1. Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'osteopath', 'user');

-- 2. Créer la table user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Activer RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Créer fonction SECURITY DEFINER pour vérifier les rôles (évite récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Créer fonction is_admin sécurisée
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 6. Mettre à jour la fonction is_admin existante pour utiliser user_roles
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(uid, 'admin')
$$;

-- 7. Policies RLS sur user_roles
-- Users peuvent voir leur propre rôle
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins peuvent voir tous les rôles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seuls les admins peuvent modifier les rôles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Migrer les données existantes de User.role vers user_roles
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
    auth_id,
    CASE 
        WHEN role = 'ADMIN' THEN 'admin'::app_role
        WHEN role = 'OSTEOPATH' THEN 'osteopath'::app_role
        ELSE 'user'::app_role
    END,
    created_at
FROM public."User"
WHERE auth_id IS NOT NULL
  AND role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Créer trigger pour auto-assigner le rôle osteopath aux nouveaux users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assigner automatiquement le rôle osteopath aux nouveaux users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'osteopath'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Attacher le trigger sur auth.users
CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- 10. Créer fonction sécurisée pour promouvoir un user en admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Accès refusé: seuls les admins peuvent promouvoir des utilisateurs';
  END IF;
  
  -- Promouvoir le user
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (target_user_id, 'admin'::app_role, auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Logger l'action
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    user_id
  ) VALUES (
    'user_roles',
    target_user_id::text,
    'PROMOTE_TO_ADMIN',
    jsonb_build_object(
      'promoted_by', auth.uid(),
      'promoted_user', target_user_id,
      'timestamp', now()
    ),
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;

-- 11. Créer view pour faciliter les requêtes de rôles
CREATE OR REPLACE VIEW public.user_roles_view AS
SELECT 
    u.id as user_id,
    u.email,
    ur.role,
    ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id;

-- Commenter la colonne role dans User (dépréciation)
COMMENT ON COLUMN public."User".role IS 'DEPRECATED: Use user_roles table instead. This column is kept for backward compatibility only.';