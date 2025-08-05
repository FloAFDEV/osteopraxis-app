-- Correction des problèmes de sécurité critiques

-- 1. Corriger les fonctions avec search_path mutable
ALTER FUNCTION public.update_google_calendar_tokens_updated_at() SET search_path = '';
ALTER FUNCTION public.cleanup_old_google_calendar_events() SET search_path = '';
ALTER FUNCTION public.update_patient_relationships_updated_at() SET search_path = '';
ALTER FUNCTION public.get_current_osteopath_id() SET search_path = '';
ALTER FUNCTION public.are_google_tokens_expired() SET search_path = '';
ALTER FUNCTION public.log_audit_action() SET search_path = '';
ALTER FUNCTION public.soft_delete_record() SET search_path = '';
ALTER FUNCTION public.restore_record() SET search_path = '';
ALTER FUNCTION public.get_subscription_limits() SET search_path = '';
ALTER FUNCTION public.admin_get_system_stats() SET search_path = '';
ALTER FUNCTION public.get_osteopath_cabinets() SET search_path = '';
ALTER FUNCTION public.can_osteopath_access_patient() SET search_path = '';
ALTER FUNCTION public.generate_invitation_code() SET search_path = '';
ALTER FUNCTION public.use_cabinet_invitation() SET search_path = '';
ALTER FUNCTION public.admin_search_patients() SET search_path = '';
ALTER FUNCTION public.get_authorized_osteopaths() SET search_path = '';
ALTER FUNCTION public.update_replacement_updated_at() SET search_path = '';
ALTER FUNCTION public.generate_recurring_appointments() SET search_path = '';
ALTER FUNCTION public.admin_get_orphan_patients() SET search_path = '';
ALTER FUNCTION public.admin_get_cabinets_with_stats() SET search_path = '';
ALTER FUNCTION public.admin_get_system_logs() SET search_path = '';
ALTER FUNCTION public.admin_get_system_health() SET search_path = '';
ALTER FUNCTION public.check_appointment_conflicts() SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.is_admin_user() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_user_osteopath_reference() SET search_path = '';
ALTER FUNCTION public.admin_get_monthly_stats() SET search_path = '';
ALTER FUNCTION public.admin_get_osteopath_stats() SET search_path = '';
ALTER FUNCTION public.admin_get_error_logs() SET search_path = '';
ALTER FUNCTION public.admin_find_patient_duplicates() SET search_path = '';
ALTER FUNCTION public.admin_deactivate_cabinet() SET search_path = '';
ALTER FUNCTION public.admin_get_detailed_stats() SET search_path = '';
ALTER FUNCTION public.can_perform_action() SET search_path = '';

-- 2. Supprimer les politiques qui autorisent l'accès anonyme et les remplacer par des politiques sécurisées

-- Commençons par nettoyer les politiques problématiques sur la table User
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."User";
DROP POLICY IF EXISTS "Politique permissive pour User" ON public."User";

-- Politique sécurisée pour User
CREATE POLICY "Authenticated users can manage their own profile" ON public."User"
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Nettoyer les politiques trop permissives sur Patient
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Patient";

-- Nettoyer les politiques trop permissives sur Appointment
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Appointment";

-- Nettoyer les politiques trop permissives sur Cabinet
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public."Cabinet";
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Cabinet";

-- Nettoyer les politiques trop permissives sur Osteopath
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public."Osteopath";
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Osteopath";

-- Nettoyer les politiques trop permissives sur Invoice
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Invoice";

-- Nettoyer les politiques trop permissives sur ProfessionalProfile
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."ProfessionalProfile";

-- 3. Créer une fonction pour créer automatiquement le profil ostéopathe
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

-- 4. Fonction pour obtenir l'ID ostéopathe courant de manière sécurisée
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id_secure()
RETURNS INTEGER
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
    
    -- Récupérer l'ID ostéopathe depuis la table User
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE u.id = auth.uid() AND u.deleted_at IS NULL;
    
    -- Si pas trouvé dans User, chercher directement dans Osteopath
    IF osteopath_id IS NULL THEN
        SELECT o.id INTO osteopath_id
        FROM public."Osteopath" o
        WHERE o."authId" = auth.uid();
    END IF;
    
    RETURN osteopath_id;
END;
$$;