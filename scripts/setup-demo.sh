#!/bin/bash
# Script pour configurer et tester le mode démo

set -e

echo "🚀 Configuration du mode démo OstéoPraxis..."

# Couleurs pour output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Vérifier que Supabase est démarré
echo -e "${BLUE}📡 Vérification de Supabase...${NC}"
if ! supabase status >/dev/null 2>&1; then
    echo -e "${RED}❌ Supabase n'est pas démarré${NC}"
    echo "Démarrage de Supabase..."
    supabase start
else
    echo -e "${GREEN}✅ Supabase est actif${NC}"
fi

# 2. Appliquer les migrations (incluant la création du compte démo)
echo -e "${BLUE}📦 Application des migrations...${NC}"
supabase db push

# 3. Vérifier que le compte démo existe
echo -e "${BLUE}🔍 Vérification du compte démo...${NC}"
DEMO_EXISTS=$(supabase db psql -c "SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo@osteopraxis.com');" -t 2>/dev/null || echo "f")

if [ "$DEMO_EXISTS" = " t" ]; then
    echo -e "${GREEN}✅ Compte démo trouvé: demo@osteopraxis.com${NC}"
else
    echo -e "${RED}❌ Compte démo non trouvé${NC}"
    echo "Création manuelle du compte démo..."

    # Créer le compte démo manuellement
    supabase db psql <<EOF
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
EOF

    echo -e "${GREEN}✅ Compte démo créé${NC}"
fi

# 4. Afficher les credentials
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Mode démo configuré avec succès !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Credentials de test:${NC}"
echo ""
echo "  👤 Mode Démo:"
echo "     Email:    demo@osteopraxis.com"
echo "     Password: demo123456"
echo ""
echo "  👨‍💼 Admin:"
echo "     Email:    afdevflo@gmail.com"
echo "     Password: [votre mot de passe personnel]"
echo ""
echo -e "${BLUE}🌐 Pour tester:${NC}"
echo "  1. Démarrez l'app: npm run dev"
echo "  2. Allez sur http://localhost:5173"
echo "  3. Cliquez sur 'Essayer la démo'"
echo "  4. Connexion automatique avec les credentials démo"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
