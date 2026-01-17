# 🏗️ MIGRATION ARCHITECTURE - STOCKAGE 100% LOCAL

**Date** : 17 Janvier 2026
**Objectif** : Éliminer toute transmission de données HDS vers Supabase cloud
**Statut** : 🔴 EN COURS

---

## 📊 ÉTAT ACTUEL vs CIBLE

### ❌ ARCHITECTURE ACTUELLE (NON CONFORME)

```
┌─────────────────────────────────────────┐
│ SUPABASE CLOUD (PostgreSQL)             │
│ ❌ Table Patient (données santé)        │
│ ❌ Table Appointment (RDV + motifs)     │
│ ❌ Table Consultation (notes médicales) │
│ ❌ Table MedicalDocument                │
│ ❌ Table TreatmentHistory               │
│ ❌ Edge Functions traitent données HDS  │
└─────────────────────────────────────────┘
              ↑
        Transmission réseau
        (VIOLATION HDS)
              ↑
┌─────────────────────────────────────────┐
│ FRONTEND (React)                        │
│ Services: supabase-api/patient          │
│           supabase-api/appointment      │
│           supabase-api/invoice          │
└─────────────────────────────────────────┘
```

**Problème** : Données de santé transitent par Supabase → Obligation HDS certifié

---

### ✅ ARCHITECTURE CIBLE (CONFORME)

```
┌─────────────────────────────────────────┐
│ SUPABASE CLOUD (PostgreSQL)             │
│ ✅ Auth (users, sessions)               │
│ ✅ Table Cabinet (adresses)             │
│ ✅ Table Osteopath (profils pros)       │
│ ✅ Table User (comptes)                 │
│ ✅ Préférences UI (non-sensibles)       │
│ ❌ ZÉRO donnée patient/santé            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ STOCKAGE LOCAL (OPFS chiffré)           │
│ ✅ Patients (AES-256-GCM)               │
│ ✅ Appointments (chiffré)               │
│ ✅ Consultations (chiffré)              │
│ ✅ Medical Documents (chiffré)          │
│ ✅ Treatment History (chiffré)          │
│ ✅ Invoices (chiffré)                   │
└─────────────────────────────────────────┘
              ↑
        Aucun réseau
        (CONFORME HDS)
              ↑
┌─────────────────────────────────────────┐
│ FRONTEND (React)                        │
│ Services: hds-secure-storage/*          │
│ (StorageRouter force local)             │
└─────────────────────────────────────────┘
```

**Solution** : Données sensibles UNIQUEMENT en local → Pas d'obligation HDS

---

## 🗂️ FICHIERS À MODIFIER/SUPPRIMER

### 🔴 EDGE FUNCTIONS À SUPPRIMER (Supabase)

| Fichier | Action | Raison |
|---------|--------|--------|
| `supabase/functions/patient/index.ts` | ❌ SUPPRIMER | Traite données patients |
| `supabase/functions/appointment/index.ts` | ❌ SUPPRIMER | Traite données RDV |
| `supabase/functions/consultation/index.ts` | ❌ SUPPRIMER | Traite notes médicales |
| `supabase/functions/medical-document/index.ts` | ❌ SUPPRIMER | Traite documents santé |
| `supabase/functions/treatment-history/index.ts` | ❌ SUPPRIMER | Traite historique soins |
| `supabase/functions/update-appointment/index.ts` | ❌ SUPPRIMER | Modifie RDV |
| `supabase/functions/google-calendar-sync/index.ts` | ⚠️ DÉSACTIVER | Risque fuite RDV patients |
| `supabase/functions/secure-publish-patient-delta/index.ts` | ❌ SUPPRIMER | Sync patients (obsolète) |
| `supabase/functions/secure-fetch-patient-deltas/index.ts` | ❌ SUPPRIMER | Fetch patients (obsolète) |

**Total** : 9 Edge Functions à supprimer

---

### 🔄 SERVICES FRONTEND À MIGRER

#### 1. Services Patient

| Fichier actuel | Migration vers | Statut |
|----------------|----------------|--------|
| `src/services/supabase-api/patient/createPatient.ts` | `hds-secure-storage/hds-secure-patient-service.ts` | ⏳ TODO |
| `src/services/supabase-api/patient/updatePatient.ts` | `hds-secure-storage/hds-secure-patient-service.ts` | ⏳ TODO |
| `src/services/supabase-api/patient/deletePatient.ts` | `hds-secure-storage/hds-secure-patient-service.ts` | ⏳ TODO |
| `src/services/supabase-api/patient/getPatients.ts` | `hds-secure-storage/hds-secure-patient-service.ts` | ⏳ TODO |
| `src/services/supabase-api/patient/getPatientById.ts` | `hds-secure-storage/hds-secure-patient-service.ts` | ⏳ TODO |

**Action** : Supprimer ces fichiers, forcer utilisation exclusive de `hds-secure-patient-service.ts`

#### 2. Services Appointment

| Fichier actuel | Migration vers | Statut |
|----------------|----------------|--------|
| `src/services/supabase-api/appointment-service.ts` | `hds-secure-storage/hds-secure-appointment-service.ts` | ⏳ TODO |

**Action** : Supprimer ce fichier, utiliser uniquement le service local

#### 3. Services Invoice

| Fichier actuel | Migration vers | Statut |
|----------------|----------------|--------|
| `src/services/supabase-api/invoice-service.ts` | `hds-secure-storage/hds-secure-invoice-service.ts` | ⏳ TODO |

**Action** : Migrer vers service local

---

### 🧹 FICHIERS À NETTOYER (Logs sensibles)

| Fichier | Lignes | Action |
|---------|--------|--------|
| `src/services/supabase-api/patient/updatePatient.ts` | 8 | Supprimer console.log patient |
| `src/components/PatientForm.tsx` | 243 | Supprimer console.log data |
| `src/components/AppointmentForm.tsx` | 256, 265 | Supprimer console.log appointment |
| `src/services/supabase-api/patient/deletePatient.ts` | 29, 44 | Supprimer console.log IDs |
| `src/services/supabase-api/patient/getPatientById.ts` | 17, 41, 45 | Supprimer console.log IDs |
| `src/services/supabase-api/patient/createPatient.ts` | 19, 23 | Supprimer console.log |
| `src/services/supabase-api/appointment-service.ts` | 50, 244 | Supprimer console.log |
| `src/services/supabase-api/invoice-service.ts` | 24, 211, 292 | Supprimer console.log |
| `src/components/patients/detail/UpcomingAppointmentsTab.tsx` | 34 | Supprimer console.log |

**Total** : ~30 console.log à supprimer

---

### ⚙️ CONFIGURATION À MODIFIER

#### supabase/config.toml
```toml
# DÉSACTIVER les Edge Functions HDS
# Commenter ou supprimer les sections :
# - [[edge_functions]] patient
# - [[edge_functions]] appointment
# - [[edge_functions]] consultation
# - [[edge_functions]] medical-document
# - [[edge_functions]] treatment-history
```

#### Migrations Supabase (Base de données)
```sql
-- SUPPRIMER les tables HDS (ou les marquer deprecated)
-- GARDER uniquement :
- auth.users
- User
- Osteopath
- Cabinet
- osteopath_cabinet
- CabinetInvitation
- google_calendar_tokens
- subscription_status
- audit_logs (anonymisés)
```

---

## 🔧 COMPOSANTS À MODIFIER

### Composants utilisant services Supabase Patient/Appointment

| Composant | Modification requise |
|-----------|---------------------|
| `src/pages/PatientsPage.tsx` | Utiliser `hds-secure-patient-service` uniquement |
| `src/pages/AppointmentsPage.tsx` | Utiliser `hds-secure-appointment-service` uniquement |
| `src/components/PatientForm.tsx` | Supprimer logs + forcer service local |
| `src/components/AppointmentForm.tsx` | Supprimer logs + forcer service local |
| `src/components/patients/detail/*` | Vérifier usage services locaux |
| `src/hooks/usePatients.ts` | Forcer service local |
| `src/hooks/useAppointments.ts` | Forcer service local |

---

## 📋 CHECKLIST MIGRATION

### Phase 1 : Nettoyage Backend
- [ ] Supprimer Edge Function `patient/index.ts`
- [ ] Supprimer Edge Function `appointment/index.ts`
- [ ] Supprimer Edge Function `consultation/index.ts`
- [ ] Supprimer Edge Function `medical-document/index.ts`
- [ ] Supprimer Edge Function `treatment-history/index.ts`
- [ ] Supprimer Edge Function `update-appointment/index.ts`
- [ ] Désactiver Edge Function `google-calendar-sync/index.ts`
- [ ] Supprimer Edge Function `secure-publish-patient-delta/index.ts`
- [ ] Supprimer Edge Function `secure-fetch-patient-deltas/index.ts`
- [ ] Modifier `supabase/config.toml` (désactiver functions HDS)

### Phase 2 : Migration Services Frontend
- [ ] Supprimer `src/services/supabase-api/patient/*` (5 fichiers)
- [ ] Supprimer `src/services/supabase-api/appointment-service.ts`
- [ ] Migrer `src/services/supabase-api/invoice-service.ts` → local
- [ ] Vérifier `StorageRouter` force bien le local pour HDS
- [ ] Tester création patient (doit être 100% local)
- [ ] Tester création RDV (doit être 100% local)
- [ ] Tester création facture (doit être 100% local)

### Phase 3 : Nettoyage Logs
- [ ] Nettoyer `src/services/supabase-api/patient/updatePatient.ts:8`
- [ ] Nettoyer `src/components/PatientForm.tsx:243`
- [ ] Nettoyer `src/components/AppointmentForm.tsx:256,265`
- [ ] Nettoyer `src/services/supabase-api/patient/deletePatient.ts:29,44`
- [ ] Nettoyer `src/services/supabase-api/patient/getPatientById.ts:17,41,45`
- [ ] Nettoyer `src/services/supabase-api/patient/createPatient.ts:19,23`
- [ ] Nettoyer `src/services/supabase-api/appointment-service.ts:50,244`
- [ ] Nettoyer `src/services/supabase-api/invoice-service.ts:24,211,292`
- [ ] Nettoyer `src/components/patients/detail/UpcomingAppointmentsTab.tsx:34`
- [ ] Audit complet `grep -r "console.log.*patient" src/`

### Phase 4 : Modifications Composants
- [ ] Modifier `src/pages/PatientsPage.tsx`
- [ ] Modifier `src/pages/AppointmentsPage.tsx`
- [ ] Modifier `src/components/PatientForm.tsx`
- [ ] Modifier `src/components/AppointmentForm.tsx`
- [ ] Modifier `src/hooks/usePatients.ts`
- [ ] Modifier `src/hooks/useAppointments.ts`

### Phase 5 : Tests Validation
- [ ] Test : Créer patient → Vérifier stockage OPFS uniquement
- [ ] Test : Créer RDV → Vérifier stockage OPFS uniquement
- [ ] Test : Créer facture → Vérifier stockage OPFS uniquement
- [ ] Test : Mode démo fonctionne toujours
- [ ] Test : Export PDF patient ne contient pas de logs
- [ ] Test : Audit réseau (DevTools) = 0 requête HDS vers Supabase
- [ ] Test : Fonctionnement offline complet

### Phase 6 : Documentation
- [ ] Créer `ARCHITECTURE.md` expliquant séparation cloud/local
- [ ] Créer `SECURITY.md` détaillant chiffrement et conformité
- [ ] Mettre à jour `README.md` avec architecture locale

---

## 🎯 CRITÈRES DE SUCCÈS

### ✅ Validation Conformité HDS
1. **Aucune donnée patient** ne quitte le navigateur
2. **Aucune table HDS** dans Supabase PostgreSQL
3. **Aucun Edge Function** ne traite de données sensibles
4. **Aucun log** de données patients/RDV/consultations
5. **Stockage 100% local** via OPFS chiffré AES-256-GCM

### ✅ Validation Fonctionnelle
1. Créer/modifier/supprimer patient → Fonctionne
2. Créer/modifier/supprimer RDV → Fonctionne
3. Créer/modifier/supprimer facture → Fonctionne
4. Export PDF → Fonctionne
5. Mode démo → Fonctionne
6. Mode offline → Fonctionne

### ✅ Validation Sécurité
1. Audit réseau : 0 requête HDS vers Supabase
2. Données OPFS chiffrées (vérifier fichiers .hds)
3. Password memory (RAM) non persisté
4. Aucun localStorage de données sensibles

---

## 📊 ESTIMATION EFFORT

| Phase | Effort | Priorité |
|-------|--------|----------|
| Nettoyage Backend | 2h | 🔴 CRITIQUE |
| Migration Services | 4h | 🔴 CRITIQUE |
| Nettoyage Logs | 2h | 🟡 HAUTE |
| Modifications Composants | 3h | 🟡 HAUTE |
| Tests Validation | 3h | 🟢 NORMALE |
| Documentation | 2h | 🟢 NORMALE |

**TOTAL** : ~16 heures de développement

---

## 📝 NOTES TECHNIQUES

### StorageRouter - Vérification
Le fichier `src/services/storage/storage-router.ts` doit :
- Forcer `local` pour : `patients`, `appointments`, `consultations`, `medical_documents`
- Autoriser `cloud` uniquement pour : `cabinets`, `osteopaths`, `users`, `preferences`

### HDS Secure Manager
Le service `src/services/hds-secure-storage/hds-secure-manager.ts` doit :
- Gérer toutes les entités HDS
- Chiffrement AES-256-GCM obligatoire
- HMAC pour intégrité
- Password dérivé via PBKDF2

### Mode Démo
Le mode démo (`demo-local-storage.ts`) doit :
- Utiliser `sessionStorage` UNIQUEMENT
- Isolation totale (0 Supabase)
- Auto-cleanup après 30min

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Créer ce document d'analyse
2. ⏳ Commencer suppression Edge Functions
3. ⏳ Migrer services frontend
4. ⏳ Nettoyer logs
5. ⏳ Tests validation
6. ⏳ Commit + push

---

**Dernière mise à jour** : 17 Janvier 2026
**Statut global** : 🔴 Migration en cours
