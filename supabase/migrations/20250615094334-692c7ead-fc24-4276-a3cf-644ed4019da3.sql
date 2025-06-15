
-- # Ajout des colonnes si manquantes

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Invoice' AND column_name='osteopathId'
  ) THEN
    ALTER TABLE public."Invoice"
      ADD COLUMN "osteopathId" INTEGER REFERENCES public."Osteopath"(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Invoice' AND column_name='cabinetId'
  ) THEN
    ALTER TABLE public."Invoice"
      ADD COLUMN "cabinetId" INTEGER REFERENCES public."Cabinet"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- # Indexation

CREATE INDEX IF NOT EXISTS idx_invoice_osteopathid ON public."Invoice" ("osteopathId");
CREATE INDEX IF NOT EXISTS idx_invoice_cabinetid ON public."Invoice" ("cabinetId");

-- # RLS activation

ALTER TABLE public."Invoice" ENABLE ROW LEVEL SECURITY;

-- # Policy SELECT : lecture possible si ostéo émetteur OU ostéo propriétaire du patient (= multi-ostéopathie)

DROP POLICY IF EXISTS "Osteopath can view their invoices" ON public."Invoice";

CREATE POLICY "Osteopath can view their invoices"
  ON public."Invoice"
  FOR SELECT
  USING (
    -- Ostéo connecté est l’émetteur
    "osteopathId" = (
      SELECT o.id FROM public."Osteopath" o
      WHERE o."userId"::text = auth.uid()::text
      LIMIT 1
    )
    -- OU propriétaire du patient
    OR "patientId" IN (
      SELECT p.id FROM public."Patient" p
      WHERE p."osteopathId" = (
        SELECT o.id FROM public."Osteopath" o
        WHERE o."userId"::text = auth.uid()::text
        LIMIT 1
      )
    )
    -- (extension future : délégation PatientAccess)
  );

-- # Policy INSERT : on vérifie que c’est l’ostéo connecté qui s’auto-désigne

DROP POLICY IF EXISTS "Osteopath can insert invoice for themselves" ON public."Invoice";

CREATE POLICY "Osteopath can insert invoice for themselves"
  ON public."Invoice"
  FOR INSERT
  WITH CHECK (
    "osteopathId" = (
      SELECT o.id FROM public."Osteopath" o
      WHERE o."userId"::text = auth.uid()::text
      LIMIT 1
    )
  );

-- # Policy UPDATE : même contrôle que INSERT (modification autorisée seulement par l’émétteur de la facture)

DROP POLICY IF EXISTS "Osteopath can update invoice for themselves" ON public."Invoice";

CREATE POLICY "Osteopath can update invoice for themselves"
  ON public."Invoice"
  FOR UPDATE
  USING (
    "osteopathId" = (
      SELECT o.id FROM public."Osteopath" o
      WHERE o."userId"::text = auth.uid()::text
      LIMIT 1
    )
  )
  WITH CHECK (
    "osteopathId" = (
      SELECT o.id FROM public."Osteopath" o
      WHERE o."userId"::text = auth.uid()::text
      LIMIT 1
    )
  );
