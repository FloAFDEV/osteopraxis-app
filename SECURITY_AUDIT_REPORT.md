# 🔒 Rapport d'Audit de Sécurité - PatientHub

**Date:** 2025-01-08  
**Type:** Application médicale - Gestion de cabinet ostéopathe  
**Contexte:** Données de santé sensibles (RGPD, HDS)

---

## ⚠️ VULNÉRABILITÉS CRITIQUES IDENTIFIÉES

### 1. BLOCAGE TOTAL DES DONNÉES PATIENTS (CRITIQUE)

**Sévérité:** 🔴 CRITIQUE - Bloque l'accès à toutes les données médicales

**Tables affectées:**
- `Patient` - Policy `HDS_TOTAL_BLOCK_PATIENT`
- `Consultation` - Policy `HDS_TOTAL_BLOCK_CONSULTATION`
- `MedicalDocument` - Policy `HDS_TOTAL_BLOCK_MEDICAL_DOCUMENT`
- `TreatmentHistory` - Policy `HDS_TOTAL_BLOCK_TREATMENT_HISTORY`

**Problème:**
```sql
-- Expression actuelle: false (BLOQUE TOUT)
Using Expression: false
With Check Expression: false
```

**Impact:**
- ❌ Les ostéopathes ne peuvent PAS accéder aux dossiers de leurs patients
- ❌ Impossibilité de créer/modifier des consultations
- ❌ Documents médicaux inaccessibles
- ❌ L'application est totalement inutilisable pour les données médicales

**Recommandation:**
Les policies doivent vérifier l'ownership via `osteopathId`:
```sql
-- Exemple pour Patient
CREATE POLICY "osteopaths_access_own_patients"
ON "Patient" FOR ALL
USING (
  "osteopathId" IN (
    SELECT id FROM "Osteopath" 
    WHERE "userId" = auth.uid()
  )
);
```

---

### 2. ACCÈS TROP PERMISSIF (CRITIQUE)

**Sévérité:** 🔴 CRITIQUE - Escalade de privilèges possible

**Tables affectées:**
- `ProfessionalProfile`
- `Invoice` (partiellement)
- `Osteopath` (partiellement)

**Problème:**
```sql
-- Policy dangereuse: "Enable all operations for authenticated users"
Using Expression: true  -- ❌ N'IMPORTE QUI authentifié peut tout faire!
```

**Impact:**
- ❌ Un ostéopathe A peut modifier le profil d'un ostéopathe B
- ❌ Un utilisateur peut voir/modifier TOUTES les factures
- ❌ Violation du principe de moindre privilège

**Exemple d'attaque:**
```javascript
// Un attaquant authentifié peut faire:
await supabase
  .from('ProfessionalProfile')
  .update({ siret: 'SIRET_VOLÉ' })
  .eq('userId', 'VICTIME_USER_ID'); // ✅ Autorisé par la policy!
```

---

### 3. POLICIES REDONDANTES ET CONFLICTUELLES

**Sévérité:** 🟡 MOYEN - Confusion et risque d'erreur

**Tables affectées:** Toutes

**Problèmes identifiés:**
- `Appointment` : 15 policies différentes (beaucoup redondantes)
- `Cabinet` : 15 policies (certaines contradictoires)
- Mélange de conventions de nommage (français/anglais)
- Policies avec `is_admin()` + policies spécifiques ostéopathe

**Impact:**
- Complexité impossible à maintenir
- Risque d'oubli lors de modifications
- Performance dégradée (Postgres évalue toutes les policies)

---

### 4. ABSENCE DE VALIDATION D'INPUT (ÉLEVÉ)

**Sévérité:** 🟠 ÉLEVÉ - Injections possibles

**Problème:** Aucune validation au niveau base de données pour:
- Emails (format)
- Numéros de téléphone (format)
- SIRET/RPPS (validation métier)
- Montants financiers (négatifs possibles)

**Exemple:**
```sql
-- Table Invoice permet:
amount: -1000€  -- ❌ Montant négatif accepté
```

**Recommandation:**
```sql
-- Ajouter des constraints
ALTER TABLE "Invoice" 
ADD CONSTRAINT invoice_amount_positive 
CHECK (amount > 0);

ALTER TABLE "Osteopath"
ADD CONSTRAINT siret_format 
CHECK (siret ~ '^[0-9]{14}$');
```

---

### 5. DONNÉES SENSIBLES NON CHIFFRÉES (CRITIQUE)

**Sévérité:** 🔴 CRITIQUE - Non-conformité HDS/RGPD

**Problème:**
- Données de santé stockées en clair dans PostgreSQL
- Pas de chiffrement au repos au niveau colonnes
- `medicalHistory`, `notes`, `diagnosis` non chiffrés

**Impact:**
- ❌ Non-conformité HDS (Hébergement Données de Santé)
- ❌ Violation RGPD Article 32 (sécurité du traitement)
- ❌ En cas de breach, données lisibles

**Recommandation:**
```sql
-- Utiliser pgcrypto pour colonnes sensibles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fonction de chiffrement
CREATE OR REPLACE FUNCTION encrypt_medical_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(data, current_setting('app.encryption_key')),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 6. ABSENCE DE RATE LIMITING EFFICACE

**Sévérité:** 🟠 ÉLEVÉ - DoS possible

**Problème:**
- Table `api_rate_limits` existe mais pas d'enforcement automatique
- Pas de limitation sur les tentatives de connexion
- Pas de protection contre force brute sur PIN

**Recommandation:**
- Implémenter rate limiting au niveau Edge Functions
- Ajouter CAPTCHA après N tentatives échouées
- Limiter les requêtes par utilisateur/IP

---

### 7. GESTION DES SESSIONS DEMO INSUFFISANTE

**Sévérité:** 🟡 MOYEN - Fuite de données possible

**Problème:**
```sql
-- demo_sessions expire après 30 minutes
expires_at: (now() + '00:30:00'::interval)

-- MAIS aucun nettoyage automatique des données démo
```

**Impact:**
- Accumulation de données démo non supprimées
- Consommation d'espace disque
- Données sensibles de test persistantes

**Recommandation:**
```sql
-- Fonction de nettoyage automatique
CREATE OR REPLACE FUNCTION cleanup_expired_demo_data()
RETURNS void AS $$
BEGIN
  DELETE FROM "Patient" 
  WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
  
  DELETE FROM "Appointment" 
  WHERE is_demo_data = true 
    AND demo_expires_at < NOW();
  
  -- Etc. pour toutes les tables
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger automatique via pg_cron
SELECT cron.schedule(
  'cleanup-demo-data',
  '*/15 * * * *',  -- Toutes les 15 minutes
  'SELECT cleanup_expired_demo_data();'
);
```

---

### 8. LOGS D'AUDIT INCOMPLETS

**Sévérité:** 🟡 MOYEN - Traçabilité insuffisante

**Problème:**
- Logs d'audit existent mais pas de trigger automatique
- Pas de logs pour accès en lecture aux données sensibles
- `audit_logs` ne capture pas tous les événements critiques

**Recommandation:**
```sql
-- Trigger automatique pour chaque table sensible
CREATE TRIGGER audit_patient_changes
AFTER INSERT OR UPDATE OR DELETE ON "Patient"
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
```

---

## 🛡️ VULNÉRABILITÉS XSS / CSRF

### XSS (Cross-Site Scripting)

**Statut:** ✅ Partiellement protégé

**Points positifs:**
- React échappe automatiquement les variables dans JSX
- Utilisation de `DOMPurify` pour les contenus riches

**Vulnérabilités potentielles:**
```typescript
// ⚠️ Vérifier si dangerouslySetInnerHTML est utilisé
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // DANGEREUX

// ❌ URLs non validées
<a href={patient.website}>Site</a>  // Risque javascript:alert()
```

**Recommandation:**
- Audit de tous les usages de `dangerouslySetInnerHTML`
- Validation stricte des URLs (`https://` uniquement)
- CSP (Content Security Policy) headers

---

### CSRF (Cross-Site Request Forgery)

**Statut:** ✅ Protégé via Supabase

**Protection:**
- Supabase utilise JWT tokens (pas de cookies)
- Tokens stockés en `httpOnly` localStorage
- Headers `Authorization: Bearer` requis

**Recommandation supplémentaire:**
- Ajouter SameSite cookies pour defense-in-depth
- Implémenter double-submit cookie pattern pour actions critiques

---

### SQL Injection

**Statut:** ✅ Protégé via Supabase client

**Protection:**
- Supabase client utilise des requêtes paramétrées
- Pas de construction manuelle de SQL

**⚠️ ATTENTION:**
- Si des Edge Functions construisent du SQL dynamique, risque élevé

---

## 📊 SCORE DE SÉCURITÉ GLOBAL

| Catégorie | Score | Statut |
|-----------|-------|--------|
| Politiques RLS | 3/10 | 🔴 CRITIQUE |
| Chiffrement données | 4/10 | 🔴 CRITIQUE |
| Validation input | 5/10 | 🟠 MOYEN |
| Authentification | 7/10 | 🟢 BON |
| Audit logs | 6/10 | 🟡 MOYEN |
| Protection XSS | 8/10 | 🟢 BON |
| Protection CSRF | 9/10 | 🟢 BON |
| Protection SQL Injection | 9/10 | 🟢 BON |

**SCORE GLOBAL: 51/80 (64%) - INSUFFISANT pour données de santé**

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### Phase 1: CRITIQUE (À faire IMMÉDIATEMENT)

1. **Débloquer l'accès aux données patients**
   - Remplacer policies `HDS_TOTAL_BLOCK_*` 
   - Implémenter ownership ostéopathe → patients

2. **Corriger les accès trop permissifs**
   - Supprimer policy `true` sur ProfessionalProfile
   - Restreindre accès Invoice par osteopathId

3. **Chiffrer les données médicales sensibles**
   - Activer pgcrypto
   - Chiffrer colonnes: notes, diagnosis, medicalHistory

### Phase 2: ÉLEVÉ (Dans les 7 jours)

4. **Validation des données**
   - Ajouter constraints SQL (montants positifs, formats)
   - Implémenter Zod schemas côté client

5. **Rate limiting**
   - Edge Functions avec rate limiting
   - Protection force brute PIN

6. **Nettoyage automatique données démo**
   - Trigger pg_cron toutes les 15 min

### Phase 3: MOYEN (Dans les 30 jours)

7. **Audit logs complets**
   - Triggers automatiques sur toutes tables sensibles
   - Logs accès lecture données patients

8. **Simplification policies RLS**
   - Supprimer doublons
   - Unifier conventions de nommage

9. **Tests de pénétration**
   - Audit externe par expert sécurité HDS
   - Certification hébergeur HDS

---

## 📋 CHECKLIST CONFORMITÉ RGPD/HDS

### RGPD

- [ ] Chiffrement données de santé au repos
- [ ] Chiffrement données de santé en transit (✅ HTTPS)
- [ ] Logs d'accès aux données personnelles
- [ ] Procédure de suppression des données (droit à l'oubli)
- [ ] Consentement explicite patients (à implémenter)
- [ ] DPO désigné
- [ ] Analyse d'impact (DPIA) effectuée

### HDS (Hébergement Données de Santé)

- [ ] Hébergeur certifié HDS
- [ ] Chiffrement AES-256 au repos
- [ ] Authentification forte (2FA recommandé)
- [ ] Traçabilité complète des accès
- [ ] Sauvegarde chiffrée des données
- [ ] Plan de reprise d'activité (PRA)
- [ ] Formation RGPD/sécurité des utilisateurs

---

## 🔗 RESSOURCES

- [Recommandations CNIL données de santé](https://www.cnil.fr/fr/la-sante)
- [Référentiel HDS](https://esante.gouv.fr/labels-certifications/hds)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

**Rapport généré automatiquement - Audit technique uniquement**  
**Pour certification HDS officielle: consulter un auditeur agréé ASIP Santé**
