
-- Créer la table de liaison osteopath_cabinet
CREATE TABLE public.osteopath_cabinet (
  id SERIAL PRIMARY KEY,
  osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  cabinet_id INTEGER NOT NULL REFERENCES public."Cabinet"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(osteopath_id, cabinet_id)
);

-- Migrer les données existantes depuis la table Osteopath
INSERT INTO public.osteopath_cabinet (osteopath_id, cabinet_id)
SELECT DISTINCT o.id, c.id
FROM public."Osteopath" o
JOIN public."Cabinet" c ON c."osteopathId" = o.id;

-- Activer RLS sur la table de liaison
ALTER TABLE public.osteopath_cabinet ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour osteopath_cabinet : un ostéopathe ne voit que ses propres associations
CREATE POLICY "Osteopaths can view their own cabinet associations"
ON public.osteopath_cabinet
FOR SELECT
TO authenticated
USING (
  osteopath_id IN (
    SELECT id FROM public."Osteopath" WHERE "authId" = auth.uid()
  )
);

-- Fonction pour obtenir tous les cabinets d'un ostéopathe
CREATE OR REPLACE FUNCTION public.get_osteopath_cabinets(osteopath_auth_id UUID)
RETURNS TABLE(cabinet_id INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT oc.cabinet_id
  FROM public.osteopath_cabinet oc
  JOIN public."Osteopath" o ON o.id = oc.osteopath_id
  WHERE o."authId" = osteopath_auth_id;
END;
$$;

-- Fonction pour vérifier si un ostéopathe peut accéder à un patient via ses cabinets
CREATE OR REPLACE FUNCTION public.can_osteopath_access_patient(osteopath_auth_id UUID, patient_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    -- Patient directement rattaché à l'ostéopathe
    SELECT 1 FROM public."Patient" p 
    JOIN public."Osteopath" o ON o.id = p."osteopathId"
    WHERE p.id = patient_id AND o."authId" = osteopath_auth_id
    
    UNION
    
    -- Patient dans un cabinet partagé
    SELECT 1 FROM public."Patient" p
    WHERE p.id = patient_id 
    AND p."cabinetId" IN (
      SELECT cabinet_id FROM public.get_osteopath_cabinets(osteopath_auth_id)
    )
  );
END;
$$;

-- Supprimer les anciennes politiques RLS trop restrictives
DROP POLICY IF EXISTS "Osteopaths can only access their own patients" ON public."Patient";
DROP POLICY IF EXISTS "Osteopaths can only access their own appointments" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can only access their own invoices" ON public."Invoice";
DROP POLICY IF EXISTS "Osteopaths can only access their own quotes" ON public."Quote";
DROP POLICY IF EXISTS "Osteopaths can only access their own cabinets" ON public."Cabinet";

-- Nouvelles politiques RLS pour Patient avec logique de partage intra-cabinet
CREATE POLICY "Osteopaths can access patients in their cabinets"
ON public."Patient"
FOR ALL
TO authenticated
USING (
  public.can_osteopath_access_patient(auth.uid(), id)
)
WITH CHECK (
  public.can_osteopath_access_patient(auth.uid(), id)
);

-- Nouvelles politiques RLS pour Appointment
CREATE POLICY "Osteopaths can access appointments in their cabinets"
ON public."Appointment"
FOR ALL
TO authenticated
USING (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
)
WITH CHECK (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
);

-- Nouvelles politiques RLS pour Invoice
CREATE POLICY "Osteopaths can access invoices in their cabinets"
ON public."Invoice"
FOR ALL
TO authenticated
USING (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
)
WITH CHECK (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
);

-- Nouvelles politiques RLS pour Quote
CREATE POLICY "Osteopaths can access quotes in their cabinets"
ON public."Quote"
FOR ALL
TO authenticated
USING (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
)
WITH CHECK (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
);

-- Nouvelles politiques RLS pour Cabinet
CREATE POLICY "Osteopaths can access their associated cabinets"
ON public."Cabinet"
FOR ALL
TO authenticated
USING (
  id IN (SELECT cabinet_id FROM public.get_osteopath_cabinets(auth.uid()))
)
WITH CHECK (
  id IN (SELECT cabinet_id FROM public.get_osteopath_cabinets(auth.uid()))
);

-- Politique pour les consultations
CREATE POLICY "Osteopaths can access consultations in their cabinets"
ON public."Consultation"
FOR ALL
TO authenticated
USING (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
)
WITH CHECK (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
);

-- Politique pour les documents médicaux
CREATE POLICY "Osteopaths can access medical documents in their cabinets"
ON public."MedicalDocument"
FOR ALL
TO authenticated
USING (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
)
WITH CHECK (
  public.can_osteopath_access_patient(auth.uid(), "patientId")
);

-- Politique pour l'historique des traitements
CREATE POLICY "Osteopaths can access treatment history in their cabinets"
ON public."TreatmentHistory"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."Consultation" c
    WHERE c.id = "consultationId"
    AND public.can_osteopath_access_patient(auth.uid(), c."patientId")
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Consultation" c
    WHERE c.id = "consultationId"
    AND public.can_osteopath_access_patient(auth.uid(), c."patientId")
  )
);
