-- Correction sécurisée des principales vulnérabilités

-- 1. Corriger seulement les fonctions qui existent
ALTER FUNCTION public.get_current_osteopath_id() SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_user_osteopath_reference() SET search_path = '';

-- 2. Créer une fonction pour créer automatiquement le profil ostéopathe
CREATE OR REPLACE FUNCTION public.ensure_osteopath_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    osteopath_id INTEGER;
BEGIN
    -- Vérifier si l'ostéopathe existe déjà
    SELECT id INTO osteopath_id
    FROM public."Osteopath"
    WHERE "authId" = NEW.id OR "userId" = NEW.id;
    
    -- Si pas d'ostéopathe, en créer un
    IF osteopath_id IS NULL THEN
        INSERT INTO public."Osteopath" (
            name,
            "authId",
            "userId",
            professional_title,
            ape_code,
            "createdAt",
            "updatedAt"
        ) VALUES (
            COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email),
            NEW.id,
            NEW.id,
            'Ostéopathe D.O.',
            '8690F',
            NOW(),
            NOW()
        ) RETURNING id INTO osteopath_id;
        
        -- Mettre à jour la référence dans User
        UPDATE public."User" 
        SET "osteopathId" = osteopath_id 
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger pour auto-création du profil ostéopathe
DROP TRIGGER IF EXISTS ensure_osteopath_profile_trigger ON public."User";
CREATE TRIGGER ensure_osteopath_profile_trigger
    AFTER INSERT OR UPDATE ON public."User"
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_osteopath_profile();

-- 3. Supprimer les politiques trop permissives et les remplacer
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."User";
DROP POLICY IF EXISTS "Politique permissive pour User" ON public."User";

-- Politique sécurisée pour User
CREATE POLICY "Authenticated users can manage their own profile" ON public."User"
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. Corriger la fonction get_current_osteopath_id pour qu'elle soit plus robuste
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id()
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    osteopath_id INTEGER;
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Première tentative via la table User avec auth_id ou id
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL;
    
    -- Si pas trouvé, essayer directement dans Osteopath
    IF osteopath_id IS NULL THEN
        SELECT o.id INTO osteopath_id
        FROM public."Osteopath" o
        WHERE o."authId" = auth.uid() OR o."userId" = auth.uid();
    END IF;
    
    RETURN osteopath_id;
END;
$$;