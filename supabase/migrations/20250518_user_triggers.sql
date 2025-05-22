
-- Cette migration doit être exécutée dans Supabase pour créer un trigger qui
-- synchronise automatiquement auth.users avec notre table User personnalisée

-- Fonction pour gérer la création automatique d'utilisateurs dans la table User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (
    id, 
    auth_id,
    email, 
    first_name, 
    last_name, 
    role, 
    created_at, 
    updated_at
  ) 
  VALUES (
    gen_random_uuid(), -- Generate a UUID for the primary key
    NEW.id, -- Store Supabase Auth user ID as auth_id
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name', 
    'OSTEOPATH', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer un trigger qui s'exécute après l'insertion d'un utilisateur dans auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
