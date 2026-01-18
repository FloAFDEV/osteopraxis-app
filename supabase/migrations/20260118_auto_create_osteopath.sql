-- ================================
-- AUTO-CRÉATION OSTEOPATH AU SIGNUP
-- Migration pour créer automatiquement un Osteopath en mode DEMO lors de l'inscription
-- ================================

-- IMPORTANT: Cette migration remplace le trigger handle_new_user() existant
-- pour y ajouter la création automatique d'un enregistrement Osteopath

-- ===========================================================================
-- FONCTION MISE À JOUR: Création User + Osteopath en mode DEMO
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id text;
  v_osteopath_id integer;
BEGIN
  -- ÉTAPE 1: Créer l'utilisateur dans la table User
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
    gen_random_uuid()::text, -- Generate a UUID for the primary key
    NEW.id::text, -- Store Supabase Auth user ID as auth_id
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'OSTEOPATH',
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_id) DO NOTHING
  RETURNING id INTO v_user_id;

  -- ÉTAPE 2: Créer automatiquement un Osteopath en mode DEMO
  -- (seulement si l'utilisateur a bien été créé et a le rôle OSTEOPATH)
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public."Osteopath" (
      "userId",
      "firstName",
      "lastName",
      email,
      phone,
      "adeli",
      status,
      demo_started_at,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      '', -- Phone vide, sera rempli dans le wizard HDS
      '', -- ADELI vide, sera rempli dans le wizard HDS
      'demo'::osteopath_status, -- Mode DEMO par défaut
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_osteopath_id;

    -- ÉTAPE 3: Lier l'osteopath_id à l'utilisateur
    IF v_osteopath_id IS NOT NULL THEN
      UPDATE public."User"
      SET "osteopathId" = v_osteopath_id,
          updated_at = NOW()
      WHERE id = v_user_id;

      RAISE NOTICE 'Osteopath créé avec succès en mode DEMO: User %, Osteopath %', v_user_id, v_osteopath_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- RÉAPPLIQUER LE TRIGGER (drop et recréer pour s'assurer de la cohérence)
-- ===========================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================================
-- NOTES IMPORTANTES
-- ===========================================================================

-- ✅ Après cette migration :
--    - Chaque inscription crée automatiquement un User ET un Osteopath
--    - Le nouveau Osteopath est en mode 'demo' par défaut
--    - L'osteopathId est automatiquement lié dans la table User
--    - Les champs ADELI et phone sont vides (remplis dans le wizard HDS)

-- 🎯 Flow utilisateur après cette migration :
--    1. Inscription (RegisterPage) → User + Osteopath créés en mode DEMO
--    2. Redirection vers /hds-setup (wizard HDS)
--    3. Wizard HDS complète les infos (ADELI, phone, cabinet, etc.)
--    4. Redirection vers /dashboard
--    5. Admin active l'ostéopathe → passage de 'demo' à 'active'

-- 🔐 Sécurité :
--    - Le statut 'demo' par défaut empêche la génération de factures officielles
--    - Seuls les admins peuvent activer un ostéopathe (via fonction activate_osteopath)
--    - L'historique des changements de statut est tracké (via osteopath_status_history)

COMMENT ON FUNCTION public.handle_new_user() IS
'Trigger function: Crée automatiquement un User et un Osteopath en mode DEMO lors de chaque inscription via Supabase Auth. L''ostéopathe est créé immédiatement (non lazy) pour éviter les erreurs 404 lors du onboarding.';
