
-- Activer RLS sur la table Quote
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux ostéopathes de voir leurs propres devis
CREATE POLICY "Osteopaths can view their own quotes" ON "Quote"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."userId" = auth.uid()
  )
);

-- Politique pour permettre aux ostéopathes de créer des devis
CREATE POLICY "Osteopaths can create quotes" ON "Quote"
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."userId" = auth.uid()
  )
);

-- Politique pour permettre aux ostéopathes de modifier leurs devis
CREATE POLICY "Osteopaths can update their own quotes" ON "Quote"
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."userId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."userId" = auth.uid()
  )
);

-- Politique pour permettre aux ostéopathes de supprimer leurs devis
CREATE POLICY "Osteopaths can delete their own quotes" ON "Quote"
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."userId" = auth.uid()
  )
);

-- Politiques pour la table QuoteItem
ALTER TABLE "QuoteItem" ENABLE ROW LEVEL SECURITY;

-- Permettre aux ostéopathes de gérer les items de leurs devis
CREATE POLICY "Osteopaths can manage quote items" ON "QuoteItem"
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Quote" q
    JOIN "Osteopath" o ON o.id = q."osteopathId"
    WHERE q.id = "QuoteItem"."quoteId"
    AND o."userId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Quote" q
    JOIN "Osteopath" o ON o.id = q."osteopathId"
    WHERE q.id = "QuoteItem"."quoteId"
    AND o."userId" = auth.uid()
  )
);
