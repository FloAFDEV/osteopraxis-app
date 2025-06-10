
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Osteopaths can view their own quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can create quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can update their own quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can delete their own quotes" ON "Quote";
DROP POLICY IF EXISTS "Osteopaths can manage quote items" ON "QuoteItem";

-- Recréer les politiques avec le bon champ authId
CREATE POLICY "Osteopaths can view their own quotes" ON "Quote"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "Osteopaths can create quotes" ON "Quote"
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "Osteopaths can update their own quotes" ON "Quote"
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "Osteopaths can delete their own quotes" ON "Quote"
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Osteopath" o
    WHERE o.id = "Quote"."osteopathId"
    AND o."authId" = auth.uid()
  )
);

CREATE POLICY "Osteopaths can manage quote items" ON "QuoteItem"
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Quote" q
    JOIN "Osteopath" o ON o.id = q."osteopathId"
    WHERE q.id = "QuoteItem"."quoteId"
    AND o."authId" = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Quote" q
    JOIN "Osteopath" o ON o.id = q."osteopathId"
    WHERE q.id = "QuoteItem"."quoteId"
    AND o."authId" = auth.uid()
  )
);
