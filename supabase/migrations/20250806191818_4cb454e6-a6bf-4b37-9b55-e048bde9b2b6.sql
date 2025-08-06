
-- Phase 1: Correction des politiques RLS et sécurité

-- 1. Nettoyer les politiques RLS conflictuelles sur la table Appointment
DROP POLICY IF EXISTS "Allow update for the user" ON "Appointment";
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON "Appointment";
DROP POLICY IF EXISTS "Les ostéopathes peuvent créer des rendez-vous" ON "Appointment";
DROP POLICY IF EXISTS "Les ostéopathes peuvent modifier leurs propres rendez-vous" ON "Appointment";
DROP POLICY IF EXISTS "Les ostéopathes peuvent voir leurs propres rendez-vous" ON "Appointment";
DROP POLICY IF EXISTS "Osteopaths can create their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "Osteopaths can delete their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "Osteopaths can manage their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "Osteopaths can update their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "Osteopaths can view their own appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_create_appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_delete_appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_read_appointments" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_strict_appointment_access" ON "Appointment";
DROP POLICY IF EXISTS "osteopath_update_appointments" ON "Appointment";
DROP POLICY IF EXISTS "update_appointments" ON "Appointment";

-- 2. Créer une politique RLS unifiée et sécurisée pour Appointment
CREATE POLICY "appointment_access_policy" ON "Appointment"
FOR ALL USING (
  -- Admins ont accès complet
  is_admin() OR
  -- Ostéopathes peuvent accéder à leurs propres rendez-vous
  "osteopathId" = get_current_osteopath_id() OR
  -- Ostéopathes peuvent accéder aux rendez-vous des patients de leurs cabinets
  "patientId" IN (
    SELECT p.id FROM "Patient" p 
    WHERE p."osteopathId" = get_current_osteopath_id() 
    OR p."cabinetId" IN (
      SELECT oc.cabinet_id FROM osteopath_cabinet oc 
      WHERE oc.osteopath_id = get_current_osteopath_id()
    )
  )
) WITH CHECK (
  -- Même logique pour les insertions/modifications
  is_admin() OR
  "osteopathId" = get_current_osteopath_id() OR
  "patientId" IN (
    SELECT p.id FROM "Patient" p 
    WHERE p."osteopathId" = get_current_osteopath_id() 
    OR p."cabinetId" IN (
      SELECT oc.cabinet_id FROM osteopath_cabinet oc 
      WHERE oc.osteopath_id = get_current_osteopath_id()
    )
  )
);

-- 3. Nettoyer les politiques RLS conflictuelles sur la table Patient
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON "Patient";
DROP POLICY IF EXISTS "Les ostéopathes peuvent créer des patients" ON "Patient";
DROP POLICY IF EXISTS "Les ostéopathes peuvent modifier leurs propres patients" ON "Patient";
DROP POLICY IF EXISTS "Les ostéopathes peuvent voir leurs propres patients" ON "Patient";
DROP POLICY IF EXISTS "Osteopaths can manage their own patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_create_patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_delete_patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_read_patients" ON "Patient";
DROP POLICY IF EXISTS "osteopath_strict_patient_access" ON "Patient";
DROP POLICY IF EXISTS "osteopath_update_patients" ON "Patient";

-- 4. Créer une politique RLS unifiée et sécurisée pour Patient
CREATE POLICY "patient_access_policy" ON "Patient"
FOR ALL USING (
  -- Admins ont accès complet
  is_admin() OR
  -- Ostéopathes peuvent accéder à leurs propres patients
  "osteopathId" = get_current_osteopath_id() OR
  -- Ostéopathes peuvent accéder aux patients de leurs cabinets
  "cabinetId" IN (
    SELECT oc.cabinet_id FROM osteopath_cabinet oc 
    WHERE oc.osteopath_id = get_current_osteopath_id()
  )
) WITH CHECK (
  -- Même logique pour les insertions/modifications
  is_admin() OR
  "osteopathId" = get_current_osteopath_id() OR
  "cabinetId" IN (
    SELECT oc.cabinet_id FROM osteoauth_cabinet oc 
    WHERE oc.osteopath_id = get_current_osteopath_id()
  )
);

-- 5. Nettoyer les politiques RLS conflictuelles sur la table Invoice
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON "Invoice";
DROP POLICY IF EXISTS "Osteopath can insert invoice for themselves" ON "Invoice";
DROP POLICY IF EXISTS "Osteopath can update invoice for themselves" ON "Invoice";
DROP POLICY IF EXISTS "Osteopath can view their invoices" ON "Invoice";
DROP POLICY IF EXISTS "Osteopaths can manage their own invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_create_invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_delete_invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_read_invoices" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_strict_invoice_access" ON "Invoice";
DROP POLICY IF EXISTS "osteopath_update_invoices" ON "Invoice";

-- 6. Créer une politique RLS unifiée et sécurisée pour Invoice
CREATE POLICY "invoice_access_policy" ON "Invoice"
FOR ALL USING (
  -- Admins ont accès complet
  is_admin() OR
  -- Ostéopathes peuvent accéder à leurs propres factures
  "osteopathId" = get_current_osteopath_id() OR
  -- Ostéopathes peuvent accéder aux factures des patients de leurs cabinets
  "patientId" IN (
    SELECT p.id FROM "Patient" p 
    WHERE p."osteopathId" = get_current_osteopath_id() 
    OR p."cabinetId" IN (
      SELECT oc.cabinet_id FROM osteopath_cabinet oc 
      WHERE oc.osteopath_id = get_current_osteopath_id()
    )
  )
) WITH CHECK (
  -- Même logique pour les insertions/modifications
  is_admin() OR
  "osteopathId" = get_current_osteopath_id() OR
  "patientId" IN (
    SELECT p.id FROM "Patient" p 
    WHERE p."osteopathId" = get_current_osteopath_id() 
    OR p."cabinetId" IN (
      SELECT oc.cabinet_id FROM osteopath_cabinet oc 
      WHERE oc.osteopath_id = get_current_osteopath_id()
    )
  )
);

-- 7. Nettoyer les politiques RLS conflictuelles sur la table Cabinet
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON "Cabinet";
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON "Cabinet";
DROP POLICY IF EXISTS "Les ostéopathes peuvent créer des cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Les ostéopathes peuvent modifier leurs propres cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Les ostéopathes peuvent voir leurs propres cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Osteopaths can manage their own cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Users can delete their own cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Users can insert cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Users can update their own cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "Users can view their own cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_create_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_delete_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_read_cabinets" ON "Cabinet";
DROP POLICY IF EXISTS "osteopath_update_cabinets" ON "Cabinet";

-- 8. Créer une politique RLS unifiée et sécurisée pour Cabinet
CREATE POLICY "cabinet_access_policy" ON "Cabinet"
FOR ALL USING (
  -- Admins ont accès complet
  is_admin() OR
  -- Propriétaires de cabinet ont accès complet
  "osteopathId" = get_current_osteopath_id() OR
  -- Ostéopathes associés au cabinet ont accès en lecture/modification
  id IN (
    SELECT oc.cabinet_id FROM osteopath_cabinet oc 
    WHERE oc.osteopath_id = get_current_osteopath_id()
  )
) WITH CHECK (
  -- Seuls les admins et propriétaires peuvent créer/modifier
  is_admin() OR
  "osteopathId" = get_current_osteopath_id()
);

-- 9. Améliorer la fonction get_current_osteopath_id pour plus de robustesse
CREATE OR REPLACE FUNCTION public.get_current_osteopath_id()
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    osteopath_id INTEGER;
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Première tentative via la table User
    SELECT u."osteopathId" INTO osteopath_id
    FROM public."User" u
    WHERE (u.auth_id = auth.uid() OR u.id = auth.uid()) 
    AND u.deleted_at IS NULL;
    
    -- Si pas trouvé, essayer directement dans Osteopath
    IF osteopath_id IS NULL THEN
        SELECT o.id INTO osteopath_id
        FROM public."Osteopath" o
        WHERE o."authId" = auth.uid() OR o."userId" = auth.uid();
    END IF;
    
    RETURN osteopath_id;
END;
$$;

-- 10. Améliorer la fonction is_admin pour plus de sécurité
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public."User"
        WHERE (id = auth.uid() OR auth_id = auth.uid())
        AND role = 'ADMIN'
        AND deleted_at IS NULL
    );
END;
$$;

-- 11. Ajouter des index pour améliorer les performances des politiques RLS
CREATE INDEX IF NOT EXISTS idx_patient_osteopath_id ON "Patient"("osteopathId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_cabinet_id ON "Patient"("cabinetId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_osteopath_id ON "Appointment"("osteopathId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_patient_id ON "Appointment"("patientId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_osteopath_id ON "Invoice"("osteopathId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_patient_id ON "Invoice"("patientId") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_osteopath_cabinet_osteopath_id ON osteopath_cabinet(osteopath_id);
CREATE INDEX IF NOT EXISTS idx_osteopath_cabinet_cabinet_id ON osteopath_cabinet(cabinet_id);

-- 12. Corriger une typo dans la politique Patient
DROP POLICY IF EXISTS "patient_access_policy" ON "Patient";

CREATE POLICY "patient_access_policy" ON "Patient"
FOR ALL USING (
  -- Admins ont accès complet
  is_admin() OR
  -- Ostéopathes peuvent accéder à leurs propres patients
  "osteopathId" = get_current_osteopath_id() OR
  -- Ostéopathes peuvent accéder aux patients de leurs cabinets
  "cabinetId" IN (
    SELECT oc.cabinet_id FROM osteopath_cabinet oc 
    WHERE oc.osteopath_id = get_current_osteopath_id()
  )
) WITH CHECK (
  -- Même logique pour les insertions/modifications
  is_admin() OR
  "osteopathId" = get_current_osteopath_id() OR
  "cabinetId" IN (
    SELECT oc.cabinet_id FROM osteopath_cabinet oc 
    WHERE oc.osteopath_id = get_current_osteopath_id()
  )
);
