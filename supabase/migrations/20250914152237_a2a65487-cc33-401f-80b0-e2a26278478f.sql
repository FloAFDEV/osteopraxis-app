-- Fonction pour créer automatiquement un profil utilisateur et ostéopathe lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_osteopath_id INTEGER;
BEGIN
  -- Créer un enregistrement dans la table User
  INSERT INTO public."User" (
    id,
    auth_id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at,
    is_active
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'OSTEOPATH',
    NOW(),
    NOW(),
    true
  );

  -- Créer un profil ostéopathe basique
  INSERT INTO public."Osteopath" (
    name,
    authId,
    userId,
    professional_title,
    ape_code,
    "createdAt",
    "updatedAt"
  ) VALUES (
    COALESCE(
      TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.id,
    NEW.id,
    'Ostéopathe D.O.',
    '8690F',
    NOW(),
    NOW()
  ) RETURNING id INTO new_osteopath_id;

  -- Mettre à jour la table User avec l'osteopathId
  UPDATE public."User" 
  SET "osteopathId" = new_osteopath_id 
  WHERE auth_id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, logger mais ne pas bloquer l'inscription
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_values,
    user_id
  ) VALUES (
    'auth_user_creation',
    NEW.id::text,
    'AUTO_PROFILE_CREATION_ERROR',
    jsonb_build_object(
      'error', SQLERRM,
      'email', NEW.email,
      'timestamp', NOW()
    ),
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger qui se déclenche après insertion d'un nouvel utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_registration();