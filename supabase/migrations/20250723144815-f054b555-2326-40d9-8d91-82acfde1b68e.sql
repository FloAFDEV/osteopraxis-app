-- Corriger le profil utilisateur démo
-- D'abord, s'assurer que l'utilisateur démo existe dans la table User
INSERT INTO public."User" (
    id,
    auth_id,
    first_name,
    last_name,
    email,
    role,
    "osteopathId",
    is_active,
    created_at,
    updated_at
) VALUES (
    '45507f32-8613-4a0a-abd6-600b73e0369d',
    '45507f32-8613-4a0a-abd6-600b73e0369d',
    'Dr. Marie',
    'Dubois',
    'demo@osteopraxis.com',
    'OSTEOPATH',
    534,
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    auth_id = EXCLUDED.auth_id,
    "osteopathId" = EXCLUDED."osteopathId",
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- S'assurer que l'ostéopathe avec l'ID 534 existe
INSERT INTO public."Osteopath" (
    id,
    "authId",
    "userId",
    name,
    professional_title,
    rpps_number,
    siret,
    ape_code,
    "createdAt",
    "updatedAt"
) VALUES (
    534,
    '45507f32-8613-4a0a-abd6-600b73e0369d',
    '45507f32-8613-4a0a-abd6-600b73e0369d',
    'Dr. Marie Dubois',
    'Ostéopathe D.O.',
    '10003123456',
    '12345678901234',
    '8690F',
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    "authId" = EXCLUDED."authId",
    "userId" = EXCLUDED."userId",
    name = EXCLUDED.name,
    professional_title = EXCLUDED.professional_title,
    rpps_number = EXCLUDED.rpps_number,
    siret = EXCLUDED.siret,
    ape_code = EXCLUDED.ape_code,
    "updatedAt" = now();