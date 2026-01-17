# 📋 PLAN DE MIGRATION - ACTIONS CONCRÈTES

**Date démarrage** : 17 Janvier 2026
**Objectif** : Application 100% locale pour données HDS

---

## ✅ ÉTAPE 1 : SUPPRESSION EDGE FUNCTIONS HDS

### Fonctions à supprimer (traitement données santé)

```bash
# Supprimer les répertoires Edge Functions HDS
rm -rf supabase/functions/patient
rm -rf supabase/functions/appointment
rm -rf supabase/functions/consultation
rm -rf supabase/functions/medical-document
rm -rf supabase/functions/treatment-history
rm -rf supabase/functions/update-appointment
rm -rf supabase/functions/secure-publish-patient-delta
rm -rf supabase/functions/secure-fetch-patient-deltas
```

### Fonctions à garder (non-HDS)

✅ `cabinet` - Gestion cabinets (adresses)
✅ `osteopath` - Profils professionnels
✅ `update-osteopath` - Mise à jour profils
✅ `update-cabinet` - Mise à jour cabinets
✅ `professional-profile` - Profils pros
✅ `completer-profil` - Onboarding
✅ `google-auth` - OAuth Google
✅ `check-subscription` - Abonnements Stripe
✅ `create-checkout` - Stripe checkout
✅ `customer-portal` - Portail Stripe
✅ `demo-cleanup` - Nettoyage données démo

### Fonctions à modifier/désactiver

⚠️ `google-calendar-sync` - **DÉSACTIVER temporairement** (risque fuite RDV)
⚠️ `invoice` - **VÉRIFIER** si facture = HDS ou non-HDS

---

## ✅ ÉTAPE 2 : SUPPRESSION SERVICES FRONTEND SUPABASE

### Services Patient (5 fichiers)

```bash
rm src/services/supabase-api/patient/createPatient.ts
rm src/services/supabase-api/patient/updatePatient.ts
rm src/services/supabase-api/patient/deletePatient.ts
rm src/services/supabase-api/patient/getPatients.ts
rm src/services/supabase-api/patient/getPatientById.ts
rm -rf src/services/supabase-api/patient/
```

### Services Appointment

```bash
rm src/services/supabase-api/appointment-service.ts
```

### Services Invoice (à migrer)

**Action** : Créer `src/services/hds-secure-storage/hds-secure-invoice-service.ts`
Puis supprimer `src/services/supabase-api/invoice-service.ts`

---

## ✅ ÉTAPE 3 : FORCER UTILISATION SERVICES LOCAUX

### Fichiers à modifier

#### `src/pages/PatientsPage.tsx`
- Remplacer imports `supabase-api/patient` → `hds-secure-storage`
- Utiliser uniquement `hdsSecurePatientService`

#### `src/pages/AppointmentsPage.tsx`
- Remplacer imports `supabase-api/appointment` → `hds-secure-storage`
- Utiliser uniquement `hdsSecureAppointmentService`

#### `src/components/PatientForm.tsx`
- Utiliser `hdsSecurePatientService.createPatient()` uniquement
- Supprimer console.log ligne 243

#### `src/components/AppointmentForm.tsx`
- Utiliser `hdsSecureAppointmentService.createAppointment()` uniquement
- Supprimer console.log lignes 256, 265

#### `src/hooks/usePatients.ts`
- Forcer service local

#### `src/hooks/useAppointments.ts`
- Forcer service local

---

## ✅ ÉTAPE 4 : NETTOYAGE LOGS SENSIBLES

### Console.log à supprimer

```typescript
// src/services/supabase-api/patient/updatePatient.ts:8
console.log("Mise à jour du patient via Edge Function:", patient); // ❌ SUPPRIMER

// src/components/PatientForm.tsx:243
console.log("Données patient avant création:", data); // ❌ SUPPRIMER

// src/components/AppointmentForm.tsx:256
console.log("Submitting appointment data:", appointmentData); // ❌ SUPPRIMER

// src/components/AppointmentForm.tsx:265
console.log('📋 AppointmentForm: Émission événement appointment-created', newAppointmentEvent); // ❌ SUPPRIMER

// src/services/supabase-api/patient/deletePatient.ts:29
console.error(`TENTATIVE DE VIOLATION...`); // ❌ SUPPRIMER

// src/services/supabase-api/patient/deletePatient.ts:44
console.log(`Patient ${id} supprimé...`); // ❌ SUPPRIMER

// src/services/supabase-api/patient/getPatientById.ts:17,41,45
console.log(`Récupération du patient...`); // ❌ SUPPRIMER

// src/services/supabase-api/patient/createPatient.ts:19,23
console.log("Creating patient for osteopathId:", osteopathId); // ❌ SUPPRIMER

// src/services/supabase-api/appointment-service.ts:50
console.log("Session utilisateur trouvée:", sessionData.session.user.id); // ❌ SUPPRIMER

// src/services/supabase-api/invoice-service.ts:24,211,292
console.log("Payload de mise à jour..."); // ❌ SUPPRIMER

// src/components/patients/detail/UpcomingAppointmentsTab.tsx:34
console.log('📅 UpcomingAppointmentsTab: Événement...'); // ❌ SUPPRIMER
```

---

## ✅ ÉTAPE 5 : VÉRIFICATION STOREROUTER

### Fichier : `src/services/storage/storage-router.ts`

Vérifier que le routeur force bien le local pour :
- `patients` → `local`
- `appointments` → `local`
- `consultations` → `local`
- `medical_documents` → `local`
- `treatment_history` → `local`
- `invoices` → `local`

Et cloud uniquement pour :
- `cabinets` → `cloud`
- `osteopaths` → `cloud`
- `users` → `cloud`
- `preferences` → `cloud`

---

## ✅ ÉTAPE 6 : DÉSACTIVATION GOOGLE CALENDAR SYNC

### Option 1 : Désactivation complète (recommandé)

```typescript
// src/hooks/useGoogleCalendar.ts
// Commenter toutes les fonctions sync
export const useGoogleCalendar = () => {
  return {
    syncGoogleCalendar: async () => {
      console.warn('Google Calendar sync désactivé pour conformité HDS');
      return { success: false, error: 'Fonctionnalité désactivée' };
    }
  };
};
```

### Option 2 : Anonymisation

Si on garde la sync, anonymiser les événements :
- Titre : "Rendez-vous" (pas de nom patient)
- Description : Vide (pas de motif)
- Location : Cabinet uniquement (pas d'info patient)

---

## ✅ ÉTAPE 7 : TESTS VALIDATION

### Tests à effectuer

1. **Test création patient**
   - Créer un patient
   - Vérifier dans DevTools Network : 0 requête vers Supabase
   - Vérifier stockage OPFS : fichier `{id}_patient.hds` existe
   - Vérifier chiffrement : fichier contient ciphertext

2. **Test création RDV**
   - Créer un rendez-vous
   - Vérifier 0 requête réseau
   - Vérifier stockage OPFS

3. **Test création facture**
   - Créer une facture
   - Vérifier 0 requête réseau
   - Vérifier stockage OPFS

4. **Test mode démo**
   - Activer mode démo
   - Créer patient/RDV
   - Vérifier sessionStorage uniquement

5. **Test offline**
   - Déconnecter Internet
   - Vérifier app fonctionne toujours
   - Créer/modifier/supprimer données

6. **Audit réseau complet**
   - Ouvrir DevTools > Network
   - Effectuer toutes les opérations
   - Filtrer requêtes Supabase
   - Vérifier uniquement auth + cabinets/osteopaths

---

## ✅ ÉTAPE 8 : DOCUMENTATION

### Fichiers à créer

1. **`ARCHITECTURE.md`**
   - Expliquer séparation cloud/local
   - Diagramme architecture
   - Flux de données

2. **`SECURITY.md`**
   - Détail chiffrement AES-256-GCM
   - Gestion password memory
   - Conformité HDS/RGPD

3. **`README.md`** (mise à jour)
   - Architecture locale
   - Fonctionnalités
   - Installation

---

## 📊 ORDRE D'EXÉCUTION

### Session 1 (2h)
1. ✅ Supprimer Edge Functions HDS (9 répertoires)
2. ✅ Supprimer services frontend patient (5 fichiers)
3. ✅ Supprimer service appointment (1 fichier)

### Session 2 (2h)
4. ✅ Nettoyer tous les console.log (11 fichiers)
5. ✅ Créer hds-secure-invoice-service.ts
6. ✅ Supprimer invoice-service.ts

### Session 3 (3h)
7. ✅ Modifier PatientsPage.tsx
8. ✅ Modifier AppointmentsPage.tsx
9. ✅ Modifier PatientForm.tsx
10. ✅ Modifier AppointmentForm.tsx
11. ✅ Modifier hooks usePatients/useAppointments

### Session 4 (2h)
12. ✅ Désactiver Google Calendar sync
13. ✅ Vérifier StorageRouter
14. ✅ Tests validation complets

### Session 5 (1h)
15. ✅ Documentation
16. ✅ Commit + Push

**TOTAL** : ~10 heures

---

## 🚨 POINTS D'ATTENTION

### Risques

1. **Breaking changes** : Les composants utilisant les services Supabase vont casser
   - **Solution** : Remplacer tous les imports en une seule fois

2. **Migration données existantes** : Les données déjà en Supabase
   - **Solution** : Script de migration (export Supabase → import local)

3. **Tests insuffisants** : Risque de bugs
   - **Solution** : Tests manuels complets avant commit

### Questions à résoudre

1. **Factures = HDS ou non-HDS ?**
   - Si HDS (lien patient) → Local
   - Si non-HDS (juste montants) → Cloud acceptable

2. **Google Calendar sync à garder ?**
   - Option A : Désactiver complètement
   - Option B : Anonymiser totalement

3. **Multi-cabinet = Cloud ou Local ?**
   - Si partage données patients → Local uniquement (pas de sync cloud)
   - Si juste config cabinet → Cloud OK

---

## ✅ PRÊT À DÉMARRER

**Commande pour démarrer** :

```bash
# Session 1 : Suppression Edge Functions + Services
cd /home/user/rendez-vous-zen-app
```

Je suis prêt à exécuter. Voulez-vous que je commence ?
