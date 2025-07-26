-- PHASE 1: Corrections critiques de sécurité - Version finale corrigée

-- 1. Activation de RLS sur la table subscription_plans (CRITIQUE)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Politique pour subscription_plans : seuls les admins peuvent accéder
CREATE POLICY "admin_only_subscription_plans" ON public.subscription_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public."User" 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 2. Suppression des politiques de développement dangereuses (accès ouvert)
DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Appointment" ON public."Appointment";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Appointment" ON public."Appointment";
DROP POLICY IF EXISTS "Dev: Tout le monde peut insérer sur Appointment" ON public."Appointment";

DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Cabinet" ON public."Cabinet";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Cabinet" ON public."Cabinet";
DROP POLICY IF EXISTS "Dev: Tout le monde peut insérer sur Cabinet" ON public."Cabinet";

DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Consultation" ON public."Consultation";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Invoice" ON public."Invoice";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur MedicalDocument" ON public."MedicalDocument";

DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Osteopath" ON public."Osteopath";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Osteopath" ON public."Osteopath";
DROP POLICY IF EXISTS "Dev: Tout le monde peut insérer sur Osteopath" ON public."Osteopath";

DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier sur Patient" ON public."Patient";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire sur Patient" ON public."Patient";
DROP POLICY IF EXISTS "Dev: Tout le monde peut insérer sur Patient" ON public."Patient";
DROP POLICY IF EXISTS "dev_open_access_patient" ON public."Patient";

DROP POLICY IF EXISTS "Dev: Tout le monde peut modifier" ON public."User";
DROP POLICY IF EXISTS "Dev: Tout le monde peut tout lire" ON public."User";
DROP POLICY IF EXISTS "Dev: Tout le monde peut insérer" ON public."User";

-- 3. Renforcement des politiques des données sensibles (patients, rendez-vous, factures)
-- Ces données seront bientôt migrées vers SQLite local, mais sécurisons-les d'abord

-- Politiques strictes pour les patients
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public."Patient";
CREATE POLICY "osteopath_strict_patient_access" ON public."Patient"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public."Osteopath" o
    WHERE o."authId" = auth.uid()
    AND o.id = "Patient"."osteopathId"
  )
);

-- Politiques strictes pour les rendez-vous
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public."Appointment";
CREATE POLICY "osteopath_strict_appointment_access" ON public."Appointment"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public."Osteopath" o
    WHERE o."authId" = auth.uid()
    AND o.id = "Appointment"."osteopathId"
  )
);

-- Politiques strictes pour les factures
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public."Invoice";
CREATE POLICY "osteopath_strict_invoice_access" ON public."Invoice"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public."Osteopath" o
    WHERE o."authId" = auth.uid()
    AND o.id = "Invoice"."osteopathId"
  )
);

-- 4. Sécurisation du stockage des fichiers (sans ambiguïté de noms)
-- Restriction stricte pour les tampons (stamps)
DROP POLICY IF EXISTS "Authenticated users can view stamps" ON storage.objects;
CREATE POLICY "osteopath_own_stamps_only" ON storage.objects
FOR ALL USING (
  bucket_id = 'stamps' AND 
  (storage.foldername(objects.name))[1] = auth.uid()::text
);

-- Restriction pour les images de cabinets (seuls les propriétaires)
DROP POLICY IF EXISTS "Autoriser l'accès public aux images des cabinets" ON storage.objects;
CREATE POLICY "cabinet_owner_images_only" ON storage.objects
FOR ALL USING (
  bucket_id = 'cabinet-images' AND 
  EXISTS (
    SELECT 1 FROM public."Cabinet" c
    INNER JOIN public."Osteopath" o ON c."osteopathId" = o.id
    WHERE o."authId" = auth.uid()
    AND c.id::text = (storage.foldername(objects.name))[1]
  )
);