-- Tighten Patient policies to authenticated users only

DROP POLICY IF EXISTS "osteopath_read_patients" ON public."Patient";
CREATE POLICY "osteopath_read_patients"
ON public."Patient"
FOR SELECT
TO authenticated
USING (
  ("osteopathId" = public.get_current_osteopath_id())
  OR (
    "cabinetId" IN (
      SELECT oc.cabinet_id FROM public.osteopath_cabinet oc
      WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
  )
);

DROP POLICY IF EXISTS "osteopath_insert_patients" ON public."Patient";
CREATE POLICY "osteopath_insert_patients"
ON public."Patient"
FOR INSERT
TO authenticated
WITH CHECK (
  "osteopathId" = public.get_current_osteopath_id()
);

DROP POLICY IF EXISTS "osteopath_update_patients" ON public."Patient";
CREATE POLICY "osteopath_update_patients"
ON public."Patient"
FOR UPDATE
TO authenticated
USING (
  ("osteopathId" = public.get_current_osteopath_id())
  OR (
    "cabinetId" IN (
      SELECT oc.cabinet_id FROM public.osteopath_cabinet oc
      WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
  )
)
WITH CHECK (
  "osteopathId" = public.get_current_osteopath_id()
);

DROP POLICY IF EXISTS "osteopath_delete_patients" ON public."Patient";
CREATE POLICY "osteopath_delete_patients"
ON public."Patient"
FOR DELETE
TO authenticated
USING (
  "osteopathId" = public.get_current_osteopath_id()
);