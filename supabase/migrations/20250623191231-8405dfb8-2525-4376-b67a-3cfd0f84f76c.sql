
-- Supprimer les anciennes politiques qui causent les erreurs
DROP POLICY IF EXISTS "Osteopaths can access patients in their cabinets" ON public."Patient";
DROP POLICY IF EXISTS "Osteopaths can access appointments in their cabinets" ON public."Appointment";
DROP POLICY IF EXISTS "Osteopaths can access invoices in their cabinets" ON public."Invoice";
DROP POLICY IF EXISTS "Osteopaths can access quotes in their cabinets" ON public."Quote";
DROP POLICY IF EXISTS "Osteopaths can access their associated cabinets" ON public."Cabinet";

-- Créer une fonction plus robuste pour récupérer l'ostéopathe connecté
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    osteopath_id INTEGER;
BEGIN
    -- Première tentative via la table User avec auth_id
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE u.auth_id = auth.uid();
    
    -- Si pas trouvé, essayer avec l'id directement
    IF osteopath_id IS NULL THEN
        SELECT u."osteopathId" INTO osteopath_id
        FROM public."User" u
        WHERE u.id = auth.uid();
    END IF;
    
    -- Si toujours pas trouvé, essayer directement dans Osteopath
    IF osteopath_id IS NULL THEN
        SELECT o.id INTO osteopath_id
        FROM public."Osteopath" o
        WHERE o."authId" = auth.uid() OR o."userId" = auth.uid();
    END IF;
    
    RETURN osteopath_id;
END;
$$;

-- Nouvelles politiques RLS simplifiées et plus robustes
CREATE POLICY "Osteopaths can access their patients"
ON public."Patient"
FOR ALL
TO authenticated
USING (
    "osteopathId" = public.get_current_osteopath_id()
    OR 
    "cabinetId" IN (
        SELECT oc.cabinet_id 
        FROM public.osteopath_cabinet oc 
        WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
)
WITH CHECK (
    "osteopathId" = public.get_current_osteopath_id()
    OR 
    "cabinetId" IN (
        SELECT oc.cabinet_id 
        FROM public.osteopath_cabinet oc 
        WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
);

CREATE POLICY "Osteopaths can access their appointments"
ON public."Appointment"
FOR ALL
TO authenticated
USING (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    "patientId" IN (
        SELECT p.id FROM public."Patient" p 
        WHERE p."osteopathId" = public.get_current_osteopath_id()
        OR p."cabinetId" IN (
            SELECT oc.cabinet_id 
            FROM public.osteopath_cabinet oc 
            WHERE oc.osteopath_id = public.get_current_osteopath_id()
        )
    )
)
WITH CHECK (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    "patientId" IN (
        SELECT p.id FROM public."Patient" p 
        WHERE p."osteopathId" = public.get_current_osteopath_id()
        OR p."cabinetId" IN (
            SELECT oc.cabinet_id 
            FROM public.osteopath_cabinet oc 
            WHERE oc.osteopath_id = public.get_current_osteopath_id()
        )
    )
);

CREATE POLICY "Osteopaths can access their invoices"
ON public."Invoice"
FOR ALL
TO authenticated
USING (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    "patientId" IN (
        SELECT p.id FROM public."Patient" p 
        WHERE p."osteopathId" = public.get_current_osteopath_id()
        OR p."cabinetId" IN (
            SELECT oc.cabinet_id 
            FROM public.osteopath_cabinet oc 
            WHERE oc.osteopath_id = public.get_current_osteopath_id()
        )
    )
)
WITH CHECK (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    "patientId" IN (
        SELECT p.id FROM public."Patient" p 
        WHERE p."osteopathId" = public.get_current_osteopath_id()
        OR p."cabinetId" IN (
            SELECT oc.cabinet_id 
            FROM public.osteopath_cabinet oc 
            WHERE oc.osteopath_id = public.get_current_osteopath_id()
        )
    )
);

CREATE POLICY "Osteopaths can access their quotes"
ON public."Quote"
FOR ALL
TO authenticated
USING (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    "patientId" IN (
        SELECT p.id FROM public."Patient" p 
        WHERE p."osteopathId" = public.get_current_osteopath_id()
        OR p."cabinetId" IN (
            SELECT oc.cabinet_id 
            FROM public.osteopath_cabinet oc 
            WHERE oc.osteopath_id = public.get_current_osteopath_id()
        )
    )
)
WITH CHECK (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    "patientId" IN (
        SELECT p.id FROM public."Patient" p 
        WHERE p."osteopathId" = public.get_current_osteopath_id()
        OR p."cabinetId" IN (
            SELECT oc.cabinet_id 
            FROM public.osteopath_cabinet oc 
            WHERE oc.osteopath_id = public.get_current_osteopath_id()
        )
    )
);

CREATE POLICY "Osteopaths can access their cabinets"
ON public."Cabinet"
FOR ALL
TO authenticated
USING (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    id IN (
        SELECT oc.cabinet_id 
        FROM public.osteopath_cabinet oc 
        WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
)
WITH CHECK (
    "osteopathId" = public.get_current_osteopath_id()
    OR
    id IN (
        SELECT oc.cabinet_id 
        FROM public.osteopath_cabinet oc 
        WHERE oc.osteopath_id = public.get_current_osteopath_id()
    )
);
