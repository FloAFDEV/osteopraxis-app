
-- Activer RLS sur la table Osteopath
ALTER TABLE "Osteopath" ENABLE ROW LEVEL SECURITY;

-- Politique pour que les ostéopathes ne voient que leur propre profil
CREATE POLICY "Osteopaths can view their own profile" 
  ON "Osteopath" 
  FOR SELECT 
  USING ("authId" = auth.uid());

-- Politique pour que les ostéopathes puissent modifier leur propre profil
CREATE POLICY "Osteopaths can update their own profile" 
  ON "Osteopath" 
  FOR UPDATE 
  USING ("authId" = auth.uid());

-- Créer la table des remplacements ostéopathe
CREATE TABLE public.osteopath_replacement (
  id SERIAL PRIMARY KEY,
  osteopath_id INTEGER NOT NULL REFERENCES "Osteopath"(id) ON DELETE CASCADE,
  replacement_osteopath_id INTEGER NOT NULL REFERENCES "Osteopath"(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Empêcher qu'un ostéopathe se remplace lui-même
  CONSTRAINT no_self_replacement CHECK (osteopath_id != replacement_osteopath_id),
  -- Index unique pour éviter les doublons
  UNIQUE(osteopath_id, replacement_osteopath_id)
);

-- Activer RLS sur la table des remplacements
ALTER TABLE public.osteopath_replacement ENABLE ROW LEVEL SECURITY;

-- Politique pour que les ostéopathes voient leurs remplacements (actifs et passifs)
CREATE POLICY "Osteopaths can view their replacements" 
  ON public.osteopath_replacement 
  FOR SELECT 
  USING (
    osteopath_id IN (SELECT id FROM "Osteopath" WHERE "authId" = auth.uid()) OR
    replacement_osteopath_id IN (SELECT id FROM "Osteopath" WHERE "authId" = auth.uid())
  );

-- Politique pour créer des remplacements (seulement pour ses propres remplacements)
CREATE POLICY "Osteopaths can create their own replacements" 
  ON public.osteopath_replacement 
  FOR INSERT 
  WITH CHECK (osteopath_id IN (SELECT id FROM "Osteopath" WHERE "authId" = auth.uid()));

-- Politique pour modifier ses remplacements
CREATE POLICY "Osteopaths can update their own replacements" 
  ON public.osteopath_replacement 
  FOR UPDATE 
  USING (osteopath_id IN (SELECT id FROM "Osteopath" WHERE "authId" = auth.uid()));

-- Politique pour supprimer ses remplacements
CREATE POLICY "Osteopaths can delete their own replacements" 
  ON public.osteopath_replacement 
  FOR DELETE 
  USING (osteopath_id IN (SELECT id FROM "Osteopath" WHERE "authId" = auth.uid()));

-- Fonction pour récupérer les ostéopathes autorisés (soi-même + remplaçants + collègues de cabinet)
CREATE OR REPLACE FUNCTION public.get_authorized_osteopaths(current_osteopath_auth_id uuid)
RETURNS TABLE(
  id integer,
  name text,
  professional_title text,
  rpps_number text,
  siret text,
  access_type text -- 'self', 'replacement', 'cabinet_colleague'
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Soi-même
  SELECT 
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'self'::text as access_type
  FROM "Osteopath" o
  WHERE o."authId" = current_osteopath_auth_id
  
  UNION
  
  -- Mes remplaçants (ceux qui peuvent me remplacer)
  SELECT 
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'replacement'::text as access_type
  FROM "Osteopath" o
  JOIN public.osteopath_replacement r ON r.replacement_osteopath_id = o.id
  JOIN "Osteopath" current_o ON current_o.id = r.osteopath_id
  WHERE current_o."authId" = current_osteopath_auth_id
    AND r.is_active = true
    AND (r.start_date IS NULL OR r.start_date <= CURRENT_DATE)
    AND (r.end_date IS NULL OR r.end_date >= CURRENT_DATE)
  
  UNION
  
  -- Ceux que je peux remplacer
  SELECT 
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'replacement'::text as access_type
  FROM "Osteopath" o
  JOIN public.osteopath_replacement r ON r.osteopath_id = o.id
  JOIN "Osteopath" current_o ON current_o.id = r.replacement_osteopath_id
  WHERE current_o."authId" = current_osteopath_auth_id
    AND r.is_active = true
    AND (r.start_date IS NULL OR r.start_date <= CURRENT_DATE)
    AND (r.end_date IS NULL OR r.end_date >= CURRENT_DATE)
  
  UNION
  
  -- Collègues de cabinet (via osteopath_cabinet)
  SELECT DISTINCT
    o.id,
    o.name,
    o.professional_title,
    o.rpps_number,
    o.siret,
    'cabinet_colleague'::text as access_type
  FROM "Osteopath" o
  JOIN public.osteopath_cabinet oc1 ON oc1.osteopath_id = o.id
  WHERE oc1.cabinet_id IN (
    SELECT oc2.cabinet_id 
    FROM public.osteopath_cabinet oc2
    JOIN "Osteopath" current_o ON current_o.id = oc2.osteopath_id
    WHERE current_o."authId" = current_osteopath_auth_id
  )
  AND o."authId" != current_osteopath_auth_id; -- Exclure soi-même
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_replacement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_osteopath_replacement_updated_at
  BEFORE UPDATE ON public.osteopath_replacement
  FOR EACH ROW
  EXECUTE FUNCTION public.update_replacement_updated_at();
