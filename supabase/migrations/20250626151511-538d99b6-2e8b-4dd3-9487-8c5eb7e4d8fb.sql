
-- Modifier la table pour utiliser la fonction generate_invitation_code() comme valeur par défaut
ALTER TABLE public.cabinet_invitations
ALTER COLUMN invitation_code SET DEFAULT generate_invitation_code();
