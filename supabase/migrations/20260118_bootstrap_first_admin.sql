-- ================================
-- BOOTSTRAP FIRST ADMIN
-- Migration pour créer le premier superadmin
-- ================================

-- ⚠️ IMPORTANT: Remplacez 'VOTRE_EMAIL@exemple.com' par votre email réel
-- Cette migration ne s'exécutera qu'une seule fois et uniquement si aucun admin n'existe

DO $$
DECLARE
    v_admin_email text := 'afdevflo@gmail.com'; -- ⬅️ Email du premier admin
    v_user_id uuid;
    v_admin_count integer;
BEGIN
    -- Vérifier si un admin existe déjà
    SELECT COUNT(*) INTO v_admin_count
    FROM public.user_roles
    WHERE role = 'admin'::app_role;

    -- Si aucun admin n'existe, créer le premier
    IF v_admin_count = 0 THEN
        -- Récupérer l'ID de l'utilisateur correspondant à l'email
        SELECT id INTO v_user_id
        FROM auth.users
        WHERE email = v_admin_email;

        -- Si l'utilisateur existe
        IF v_user_id IS NOT NULL THEN
            -- Promouvoir en admin
            INSERT INTO public.user_roles (user_id, role, created_at)
            VALUES (v_user_id, 'admin'::app_role, now())
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
                v_user_id::text,
                'BOOTSTRAP_FIRST_ADMIN',
                jsonb_build_object(
                    'email', v_admin_email,
                    'user_id', v_user_id,
                    'timestamp', now(),
                    'note', 'First admin created via bootstrap migration'
                ),
                v_user_id
            );

            RAISE NOTICE 'Premier admin créé avec succès: % (ID: %)', v_admin_email, v_user_id;
        ELSE
            RAISE WARNING 'Utilisateur avec email % introuvable. Créez d''abord votre compte via /register', v_admin_email;
        END IF;
    ELSE
        RAISE NOTICE 'Un admin existe déjà (% admins). Migration ignorée.', v_admin_count;
    END IF;
END $$;

-- ================================
-- FONCTION DE SÉCURITÉ
-- Empêcher la création de multiples admins sans audit
-- ================================

-- Créer une contrainte CHECK pour limiter les admins (optionnel - désactivé par défaut)
-- Décommentez si vous voulez limiter à 1 seul admin maximum
/*
ALTER TABLE public.user_roles
ADD CONSTRAINT limit_admin_count
CHECK (
    role != 'admin'::app_role OR
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin'::app_role) <= 3
);
*/

COMMENT ON TABLE public.user_roles IS 'Table des rôles utilisateurs. ADMIN role est protégé et ne peut être assigné que par un admin existant ou via la migration bootstrap.';
