-- ============================================
-- CORRECTION MULTI-TENANT : Cabinet et Appointment
-- Suppression des politiques trop permissives
-- ============================================

-- ============================================
-- TABLE: Cabinet - Correction Multi-Tenant
-- ============================================

-- Supprimer les politiques dangereuses qui permettent à TOUS les users authentifiés de tout voir
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public."Cabinet";
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Cabinet";

-- Garder uniquement les politiques qui filtrent correctement :
-- 1. "Allow demo data access" - OK, filtre is_demo_data = true
-- 2. "Les admins peuvent tout voir et modifier sur Cabinet" - OK, filtre is_admin()
-- 3. "Les ostéopathes peuvent créer des cabinets" - OK, vérifie osteopathId
-- 4. "Les ostéopathes peuvent modifier leurs propres cabinets" - OK, vérifie osteopathId
-- 5. "Les ostéopathes peuvent voir leurs propres cabinets" - OK, vérifie osteopathId
-- 6. "Osteopaths can access their cabinets" - OK, vérifie get_current_osteopath_id()
-- 7. Etc. - toutes les autres sont OK car elles filtrent

-- ============================================
-- TABLE: Appointment - Correction Multi-Tenant
-- ============================================

-- Supprimer la politique dangereuse qui permet à TOUS les users authentifiés de tout voir
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public."Appointment";

-- Garder uniquement les politiques qui filtrent correctement :
-- 1. "Allow demo data access" - OK, filtre is_demo_data = true
-- 2. "HDS_ADMIN_ACCESS_WITH_AUDIT_APPOINTMENT" - OK, admin avec audit
-- 3. "HDS_BLOCK_ALL_APPOINTMENT_ACCESS" - OK, bloque accès HDS
-- 4. "Les admins peuvent tout voir et modifier sur Appointment" - OK
-- 5. "Les ostéopathes peuvent créer des rendez-vous" - OK, vérifie patient/osteopath
-- 6. "Osteopaths can create their own appointments" - OK
-- 7. "Osteopaths can manage their own appointments" - OK
-- 8. Etc. - toutes les autres sont OK car elles filtrent

-- ============================================
-- VÉRIFICATION : S'assurer qu'il reste des politiques valides
-- ============================================

-- Les politiques restantes pour Cabinet :
-- - Admin access
-- - Demo data access (PRÉSERVÉ)
-- - Osteopath-specific policies (filtrage correct)

-- Les politiques restantes pour Appointment :
-- - Admin access
-- - Demo data access (PRÉSERVÉ)
-- - Osteopath-specific policies (filtrage correct)