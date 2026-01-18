-- Migration: Créer le compte démo avec credentials
-- Email: demo@osteopraxis.com
-- Password: demo123456

-- 1. Insérer l'utilisateur dans auth.users (si pas déjà existant)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at,
    confirmation_token,
    is_sso_user
)
SELECT
    '45507f32-8613-4a0a-abd6-600b73e0369d'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'demo@osteopraxis.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    '{"is_demo": true, "is_demo_user": true}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    false
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'demo@osteopraxis.com'
);

-- 2. Créer l'identité dans auth.identities (pour email/password login)
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    '45507f32-8613-4a0a-abd6-600b73e0369d'::uuid,
    jsonb_build_object(
        'sub', '45507f32-8613-4a0a-abd6-600b73e0369d',
        'email', 'demo@osteopraxis.com'
    ),
    'email',
    now(),
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1
    FROM auth.identities
    WHERE user_id = '45507f32-8613-4a0a-abd6-600b73e0369d'::uuid
    AND provider = 'email'
);

-- 3. Confirmation : Le compte démo est prêt
DO $$
BEGIN
    RAISE NOTICE '✅ Compte démo créé: demo@osteopraxis.com / demo123456';
    RAISE NOTICE '⚠️  Ce compte est réservé pour la démo publique';
END $$;
