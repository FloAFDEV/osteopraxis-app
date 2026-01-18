# 🧹 AUDIT COMPLET FRONT - NETTOYAGE & SÉCURITÉ

**Date** : 17 Janvier 2026
**Objectif** : Nettoyer, organiser et sécuriser le front pour architecture hybride HDS
**Scope** : React + TypeScript + Tailwind + Supabase Client
**Pages auditées** : 49
**Dossiers composants** : 31

---

## 📋 SOMMAIRE EXÉCUTIF

### Findings critiques

🔴 **CRITIQUE** :
- 5 pages de debug/test en production
- Composants dupliqués (3 versions PatientForm)
- Console.log résiduels (~15 fichiers)
- Clés localStorage non prefixées
- Services mixant HDS et non-HDS

🟡 **HAUTE** :
- Structure dossiers non organisée (HDS/non-HDS mélangés)
- Pas de séparation claire composants UI vs métier
- Imports directs Supabase dans composants (au lieu de services)

🟢 **MOYENNE** :
- Nommage incohérent (PatientsPage vs NewPatientPage)
- Pages marketing peu utilisées (Pricing, Tips, etc.)

### Actions prioritaires

1. **Phase 1 (URGENT)** : Supprimer pages debug, nettoyer logs, isoler HDS
2. **Phase 2** : Réorganiser structure dossiers
3. **Phase 3** : Renommer pour cohérence

---

## 1. AUDIT_ROUTES

### ✅ Routes PRODUCTION (à conserver)

**Authentification** (3 pages) :
- ✅ `LoginPage.tsx` - Connexion utilisateur
- ✅ `RegisterPage.tsx` - Inscription
- ✅ `Home.tsx` - Page d'accueil

**Dashboard** (2 pages) :
- ✅ `DashboardPage.tsx` - Tableau de bord principal
- ✅ `Index.tsx` - Redirection vers dashboard

**Patients** (4 pages) :
- ✅ `PatientsPage.tsx` - Liste patients (HDS)
- ✅ `NewPatientPage.tsx` - Création patient (HDS)
- ✅ `EditPatientPage.tsx` - Édition patient (HDS)
- ✅ `PatientDetailPage.tsx` - Détail patient (HDS)

**Rendez-vous** (4 pages) :
- ✅ `AppointmentsPage.tsx` - Calendrier RDV (HDS)
- ✅ `NewAppointmentPage.tsx` - Création RDV (HDS)
- ✅ `EditAppointmentPage.tsx` - Édition RDV (HDS)
- ✅ `ImmediateAppointmentPage.tsx` - RDV immédiat (HDS)
- ✅ `SchedulePage.tsx` - Planning global

**Factures** (4 pages) :
- ✅ `InvoicesPage.tsx` - Liste factures (HDS)
- ✅ `NewInvoicePage.tsx` - Création facture (HDS)
- ✅ `EditInvoicePage.tsx` - Édition facture (HDS)
- ✅ `InvoiceDetailPage.tsx` - Détail facture (HDS)

**Cabinets** (5 pages) :
- ✅ `CabinetsManagementPage.tsx` - Gestion cabinets (non-HDS)
- ✅ `NewCabinetPage.tsx` - Création cabinet (non-HDS)
- ✅ `EditCabinetPage.tsx` - Édition cabinet (non-HDS)
- ✅ `CabinetSettingsPage.tsx` - Paramètres cabinet (non-HDS)
- ✅ `CabinetInvitationsPage.tsx` - Invitations collaborateurs (non-HDS)

**Profil & Paramètres** (5 pages) :
- ✅ `OsteopathProfilePage.tsx` - Profil ostéopathe (non-HDS)
- ✅ `OsteopathSettingsPage.tsx` - Paramètres ostéopathe
- ✅ `SettingsPage.tsx` - Paramètres généraux
- ✅ `CollaborationsSettingsPage.tsx` - Paramètres collaborations
- ✅ `TeamManagementPage.tsx` - Gestion équipe

**Stockage HDS** (3 pages) :
- ✅ `HDSOnboardingWizard.tsx` - Configuration initiale HDS
- ✅ `HybridStorageSettingsPage.tsx` - Paramètres stockage hybride
- ✅ `ConnectedStorageSettingsPage.tsx` - Stockage connecté

**Import/Export** (1 page) :
- ✅ `DataImportPage.tsx` - Import données (CSV, Excel)

**Démo** (1 page) :
- ✅ `InteractiveDemoPage.tsx` - Mode démo 30min

**Marketing** (5 pages) :
- ✅ `LandingPage.tsx` - Page d'accueil marketing
- ✅ `PricingPage.tsx` - Tarifs (peu utilisé ?)
- ✅ `ContactPage.tsx` - Contact
- ✅ `HelpPage.tsx` - Aide
- ✅ `TipsPage.tsx` - Conseils (peu utilisé ?)

**Légal** (2 pages) :
- ✅ `PrivacyPolicyPage.tsx` - Politique confidentialité
- ✅ `TermsOfServicePage.tsx` - CGU

**Erreurs** (1 page) :
- ✅ `NotFound.tsx` - Page 404

**TOTAL PRODUCTION** : 45 pages ✅

---

### 🔴 Routes DEBUG/TEST (à supprimer en Phase 1)

**Pages de debug** (4 pages) :
- ❌ `AdminDashboardPage.tsx` - Admin dashboard (temporaire ?)
- ❌ `AdminPage.tsx` - Page admin (temporaire ?)
- ❌ `AdminTechDebugPage.tsx` - **DEBUG TECHNIQUE** 🔴
- ❌ `DebugAuthPage.tsx` - **DEBUG AUTH** 🔴
- ❌ `SecurityAuditPage.tsx` - **AUDIT SÉCURITÉ** 🔴
- ❌ `UserJourneyVisualizationPage.tsx` - **VISUALISATION TEST** 🔴
- ❌ `ConfigurationPage.tsx` - **CONFIG DEBUG** 🔴
- ❌ `PlanSelectionPage.tsx` - **SÉLECTION PLAN** (pas encore implémenté ?)

**TOTAL DEBUG** : 4-8 pages à vérifier ❌

**Action** :
- Vérifier si AdminDashboardPage/AdminPage sont utilisés en production
- Supprimer toutes les pages de debug/test
- Ou déplacer dans dossier `__dev__/` hors build production

---

### 📊 Classification par sensibilité HDS

**Pages HDS (données sensibles locales)** :
- Patients : 4 pages
- Rendez-vous : 5 pages
- Factures : 4 pages
- **TOTAL** : 13 pages HDS ✅

**Pages NON-HDS (données cloud OK)** :
- Auth : 3 pages
- Cabinets : 5 pages
- Profils : 5 pages
- Stockage : 3 pages
- Marketing : 5 pages
- Légal : 2 pages
- Divers : 9 pages
- **TOTAL** : 32 pages non-HDS ✅

**Pages DEBUG** : 4-8 pages ❌

---

## 2. AUDIT_COMPONENTS

### Structure actuelle (31 dossiers)

```
src/components/
├── admin/                      # Admin (à vérifier si prod)
├── appointments/               # RDV (HDS) ✅
├── auth/                       # Auth (non-HDS) ✅
├── calendar/                   # Calendrier (HDS) ✅
├── dashboard/                  # Dashboard (mixte)
├── demo/                       # Démo ✅
├── export/                     # Export (HDS) ✅
├── forms/                      # Forms génériques
├── hds/                        # HDS compliance ✅
├── import/                     # Import (HDS)
├── invoices/                   # Factures (HDS) ✅
├── layout/                     # Layout général
├── marketing/                  # Marketing (non-HDS)
├── osteopath-profile-form/     # Profil ostéo (non-HDS)
├── patient-card/               # Patient (HDS) ✅
├── patient-form/               # Patient form (HDS) ✅
├── patients/                   # Patients (HDS) ✅
├── payments/                   # Paiements (non-HDS)
├── pdf/                        # PDF export (HDS)
├── security/                   # Sécurité ✅
├── settings/                   # Paramètres (mixte)
├── storage/                    # Stockage HDS ✅
├── subscription/               # Abonnements (non-HDS)
├── team/                       # Équipe (non-HDS)
├── ui/                         # UI générique ✅
└── ... (autres)
```

### 🔴 Composants dupliqués / prototypes

**PatientForm** - **3 VERSIONS** 🔴 :
- `src/components/PatientForm.tsx` - Version principale ?
- `src/components/patient-form/` - Dossier complet
- `src/components/forms/FormPatient.tsx` - Doublon ?

**Action** : Consolider en UNE seule version

**AppointmentForm** - **2 VERSIONS** ⚠️ :
- `src/components/AppointmentForm.tsx` - Version principale
- `src/components/forms/FormAppointment.tsx` - Doublon ?

**Action** : Vérifier et supprimer doublon

**InvoiceForm** - **2 VERSIONS** ⚠️ :
- Similaire aux autres forms
- **Action** : Audit à faire

### 🔴 Composants admin/debug

**À vérifier** :
- `src/components/admin/` - Utilisé en production ?
  - `deleted-records-manager.tsx` - Gestion suppressions
  - Autres composants admin

**Action** :
- Si admin nécessaire → OK
- Si debug uniquement → Supprimer ou déplacer `__dev__/`

### ✅ Composants bien organisés

**HDS** :
- ✅ `components/hds/` - Conformité HDS
- ✅ `components/storage/` - Stockage sécurisé
- ✅ `components/patients/` - Patients
- ✅ `components/appointments/` - RDV
- ✅ `components/invoices/` - Factures

**UI** :
- ✅ `components/ui/` - Composants de base (shadcn/ui)

**Sécurité** :
- ✅ `components/security/` - Sécurité

---

## 3. AUDIT_STORAGE

### Accès au localStorage

**Fichiers accédant à localStorage** (recherche `localStorage`) :

#### ✅ Légitimes (non-HDS)

1. **Auth** :
   - `src/contexts/AuthContext.tsx` - Session auth Supabase
   - Clé : `sb-jpjuvzpqfirymtjwnier-auth-token`
   - **OK** : Token auth non-HDS

2. **HDS Skip** :
   - `src/contexts/HybridStorageContext.tsx` - Skip configuration
   - Clé : `hds-storage-skip`
   - **OK** : Préférence utilisateur

3. **Cabinet sélectionné** :
   - `src/contexts/HybridStorageContext.tsx` - Nettoyage cabinet
   - Clé : `selectedCabinetId`
   - **⚠️ À VÉRIFIER** : Peut contenir lien indirect avec patients ?

4. **Migration PIN** :
   - Clé : `temp-storage-pin-hash`
   - **OK** : Hash uniquement, pas de données

5. **Config stockage** :
   - Clé : `hybrid-storage-config`
   - **OK** : Config uniquement

#### ⚠️ À surveiller

**`selectedCabinetId`** :
- **Risque** : Si ID cabinet permet corrélation avec patients
- **Solution** : Ne stocker que le ID, pas de données
- **Action** : Vérifier usage

### Accès à OPFS (Origin Private File System)

**Services OPFS** :
- ✅ `src/services/hds-secure-storage/` - Tout le stockage HDS
- ✅ `src/services/security/secure-file-storage.ts` - Fichiers chiffrés
- ✅ `src/services/native-file-storage/` - Adaptateurs OPFS

**Données stockées** :
- ✅ Patients : `{id}_patients.hds` (chiffré AES-256-GCM)
- ✅ Appointments : `{id}_appointments.hds` (chiffré)
- ✅ Invoices : `{id}_invoices.hds` (chiffré)

**Format clés** :
- ⚠️ **Pas de prefix** - Juste `{id}_{entity}.hds`
- **Recommandation** : Ajouter prefix `hds_v1_{id}_{entity}.hds`

### Accès à IndexedDB

**Fallback mode iframe** :
- ✅ `src/services/hds-secure-storage/hds-secure-manager.ts`
- Utilise IndexedDB chiffré si OPFS indisponible
- **OK** : Chiffrement AES-256-GCM maintenu

### Accès à sessionStorage

**Mode démo** :
- ✅ `src/services/storage/demo-local-storage.ts`
- Clés : `demo-patients`, `demo-appointments`, etc.
- **OK** : Données fictives, auto-cleanup 30min

---

## 4. AUDIT_NETWORK

### Appels Supabase directs

**Recherche** : `supabase.from(` dans le code

#### ✅ Appels NON-HDS (légitimes)

1. **Cabinets** :
   - `src/services/supabase-api/cabinet/` - CRUD cabinets
   - **OK** : Données non-HDS

2. **Ostéopathes** :
   - `src/services/supabase-api/osteopath/` - CRUD ostéopathes
   - **OK** : Profils pros non-HDS

3. **Invitations** :
   - `src/services/supabase-api/cabinet-invitation-service.ts`
   - **OK** : Non-HDS

4. **Auth** :
   - `src/services/supabase-api/auth-service.ts`
   - **OK** : Auth cloud autorisée

#### ❌ Appels HDS (SUPPRIMÉS - Phase migration précédente)

- ✅ `patient-service.ts` - **SUPPRIMÉ** ✅
- ✅ `appointment-service.ts` - **SUPPRIMÉ** ✅
- ⚠️ `invoice-service.ts` - **ENCORE PRÉSENT** 🔴

**PROBLÈME CRITIQUE** : `src/services/supabase-api/invoice-service.ts` existe encore !

**Contenu** :
- Appels `supabase.from("Invoice")`
- Transmission données factures vers Supabase
- **VIOLATION** : Factures = HDS → Doit être 100% local

**Action URGENTE** :
1. Vérifier si `invoice-service.ts` est encore utilisé
2. Si oui : Migrer vers `hds-secure-invoice-service.ts`
3. Supprimer `supabase-api/invoice-service.ts`

### Appels API externes

**Google OAuth** :
- ✅ `src/services/api/auth-service.ts` - OAuth Google
- **OK** : Tokens uniquement, pas de données HDS

**Google Calendar** :
- ⚠️ `supabase/functions/google-calendar-sync/` - **DÉSACTIVÉ**
- **OK** : Désactivé en Phase migration

### Imports Supabase dans composants

**Recherche** : `import.*supabase.*from.*integrations`

**Problème** : Certains composants importent directement le client Supabase au lieu de passer par des services

**Exemples à corriger** :
- Composants UI qui importent Supabase directement
- **Action** : Centraliser dans services uniquement

---

## 5. AUDIT_LOGS

### Console.log avec données sensibles

**Recherche effectuée** : `grep -r "console.log" src/ | grep -E "(patient|appointment|invoice)"`

**Déjà nettoyés (Phase migration)** ✅ :
- `PatientForm.tsx:243` - ✅ Supprimé
- `AppointmentForm.tsx:256,265` - ✅ Supprimé
- `UpcomingAppointmentsTab.tsx:34` - ✅ Supprimé
- `invoice-service.ts:211,292` - ✅ Supprimé

**Résiduels à vérifier** ⚠️ :

1. **Audit nécessaire** :
   ```bash
   # Chercher console.log dans tous les fichiers
   grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | wc -l
   ```

   **Résultat estimé** : ~50-100 console.log

2. **Catégories** :
   - Debug bénins (`console.log('Component mounted')`) - OK
   - Logs de données (`console.log(patient)`) - ❌ CRITIQUE
   - Logs d'IDs (`console.log('Patient ID:', id)`) - ⚠️ MOYENNE

**Action** :
1. Grep complet de tous les console.log
2. Classifier : bénin / ID / données
3. Supprimer logs sensibles
4. Ajouter ESLint rule : `no-console` en production

---

## 6. CLEAN_STRUCTURE

### 🎯 Structure CIBLE recommandée

```
src/
├── app/                        # App root (routing, providers)
│   ├── App.tsx
│   └── main.tsx
│
├── pages/                      # Pages (routes)
│   ├── auth/                   # Auth pages (non-HDS)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── Home.tsx
│   │
│   ├── hds/                    # Pages HDS (données sensibles)
│   │   ├── patients/
│   │   │   ├── PatientsPage.tsx
│   │   │   ├── NewPatientPage.tsx
│   │   │   ├── EditPatientPage.tsx
│   │   │   └── PatientDetailPage.tsx
│   │   ├── appointments/
│   │   │   ├── AppointmentsPage.tsx
│   │   │   ├── NewAppointmentPage.tsx
│   │   │   ├── EditAppointmentPage.tsx
│   │   │   └── SchedulePage.tsx
│   │   ├── invoices/
│   │   │   ├── InvoicesPage.tsx
│   │   │   ├── NewInvoicePage.tsx
│   │   │   ├── EditInvoicePage.tsx
│   │   │   └── InvoiceDetailPage.tsx
│   │   └── consultations/      # À CRÉER Phase 2
│   │       ├── ConsultationReportPage.tsx
│   │       └── EditConsultationReportPage.tsx
│   │
│   ├── cloud/                  # Pages cloud (non-HDS)
│   │   ├── cabinets/
│   │   ├── profile/
│   │   └── team/
│   │
│   ├── settings/               # Paramètres
│   │   ├── SettingsPage.tsx
│   │   ├── HDS OnboardingWizard.tsx
│   │   └── HybridStorageSettingsPage.tsx
│   │
│   ├── marketing/              # Marketing
│   │   ├── LandingPage.tsx
│   │   ├── PricingPage.tsx
│   │   └── ContactPage.tsx
│   │
│   ├── legal/                  # Légal
│   │   ├── PrivacyPolicyPage.tsx
│   │   └── TermsOfServicePage.tsx
│   │
│   ├── demo/                   # Démo
│   │   └── InteractiveDemoPage.tsx
│   │
│   └── misc/                   # Divers
│       ├── DashboardPage.tsx
│       └── NotFound.tsx
│
├── components/
│   ├── hds/                    # Composants HDS uniquement
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── invoices/
│   │   ├── consultations/      # À CRÉER Phase 2
│   │   └── files/              # À CRÉER Phase 2 (photos/PDF)
│   │
│   ├── cloud/                  # Composants cloud uniquement
│   │   ├── cabinets/
│   │   ├── profile/
│   │   └── team/
│   │
│   ├── ui/                     # UI générique (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── layout/                 # Layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   │
│   ├── forms/                  # Forms génériques
│   │   └── (composants réutilisables)
│   │
│   └── security/               # Sécurité
│       ├── SecureFileStorage.tsx
│       └── PasswordPrompt.tsx
│
├── services/
│   ├── hds/                    # Services HDS (local uniquement)
│   │   ├── patient-service.ts  # hds-secure-patient-service
│   │   ├── appointment-service.ts
│   │   ├── invoice-service.ts
│   │   ├── consultation-service.ts  # À CRÉER Phase 2
│   │   ├── file-service.ts          # À CRÉER Phase 2
│   │   └── storage/
│   │       ├── hds-manager.ts
│   │       ├── encryption.ts
│   │       └── opfs-adapter.ts
│   │
│   ├── cloud/                  # Services cloud (Supabase)
│   │   ├── auth-service.ts
│   │   ├── cabinet-service.ts
│   │   ├── osteopath-service.ts
│   │   └── supabase-client.ts
│   │
│   ├── demo/                   # Services démo
│   │   └── demo-storage.ts
│   │
│   └── utils/                  # Utilitaires
│       ├── crypto.ts
│       ├── date.ts
│       └── validation.ts
│
├── hooks/                      # Hooks React
│   ├── hds/                    # Hooks HDS
│   │   ├── usePatients.ts
│   │   ├── useAppointments.ts
│   │   └── useInvoices.ts
│   │
│   ├── cloud/                  # Hooks cloud
│   │   ├── useCabinets.ts
│   │   └── useOsteopaths.ts
│   │
│   └── common/                 # Hooks communs
│       ├── useAuth.ts
│       └── useHybridStorage.ts
│
├── contexts/                   # Contexts React
│   ├── AuthContext.tsx
│   ├── HybridStorageContext.tsx
│   └── DemoContext.tsx
│
├── types/                      # Types TypeScript
│   ├── hds/                    # Types HDS
│   │   ├── patient.ts
│   │   ├── appointment.ts
│   │   ├── invoice.ts
│   │   └── consultation.ts     # À CRÉER Phase 2
│   │
│   ├── cloud/                  # Types cloud
│   │   ├── cabinet.ts
│   │   └── osteopath.ts
│   │
│   └── common/                 # Types communs
│       └── index.ts
│
├── utils/                      # Utilitaires globaux
│   ├── crypto.ts
│   ├── date.ts
│   ├── validation.ts
│   └── demo-detection.ts
│
└── __dev__/                    # DEV UNIQUEMENT (exclu du build prod)
    ├── pages/
    │   ├── AdminTechDebugPage.tsx
    │   ├── DebugAuthPage.tsx
    │   ├── SecurityAuditPage.tsx
    │   └── UserJourneyVisualizationPage.tsx
    └── components/
        └── DevTools.tsx
```

### 🎯 Règles de séparation HDS / non-HDS

**Règle 1 - Dossiers** :
- ✅ Tout ce qui est HDS → Dossier `hds/` ou `local/`
- ✅ Tout ce qui est cloud → Dossier `cloud/` ou `supabase/`
- ❌ JAMAIS mélanger HDS et cloud dans le même dossier

**Règle 2 - Imports** :
- ✅ Fichiers `hds/` peuvent importer depuis `hds/` et `utils/`
- ❌ Fichiers `hds/` **NE PEUVENT PAS** importer depuis `cloud/` ou Supabase
- ✅ Fichiers `cloud/` peuvent importer Supabase
- ❌ Fichiers `cloud/` **NE PEUVENT PAS** manipuler données HDS

**Règle 3 - Nommage** :
- ✅ Services HDS : `hds-{entity}-service.ts`
- ✅ Services cloud : `{entity}-service.ts` ou `supabase-{entity}-service.ts`
- ✅ Clés stockage : `hds_v1_{entity}_{id}`

**Règle 4 - ESLint** :
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["**/cloud/*", "**/supabase/*"],
            "message": "HDS files cannot import cloud services"
          }
        ]
      }
    ]
  }
}
```

---

## 7. RENAME_PLAN

### Plan de renommage Phase par Phase

#### Phase 1 - Services HDS

**Renommer** :
- `hds-secure-patient-service.ts` → `hds-patient-service.ts`
- `hds-secure-appointment-service.ts` → `hds-appointment-service.ts`
- `hds-secure-invoice-service.ts` → `hds-invoice-service.ts`
- `hds-secure-manager.ts` → `hds-storage-manager.ts`

**Raison** : "secure" est redondant (tout HDS est secure par définition)

#### Phase 2 - Pages HDS

**Créer sous-dossiers** :
- `src/pages/patients/` → `src/pages/hds/patients/`
- `src/pages/appointments/` → `src/pages/hds/appointments/`
- `src/pages/invoices/` → `src/pages/hds/invoices/`

**Renommer** :
- `PatientsPage.tsx` → `hds/patients/ListPage.tsx`
- `NewPatientPage.tsx` → `hds/patients/NewPage.tsx`
- `EditPatientPage.tsx` → `hds/patients/EditPage.tsx`
- `PatientDetailPage.tsx` → `hds/patients/DetailPage.tsx`

(Idem pour appointments et invoices)

**Raison** : Clarté et organisation

#### Phase 3 - Composants

**Consolider PatientForm** :
- Supprimer `components/PatientForm.tsx`
- Supprimer `components/forms/FormPatient.tsx`
- Garder uniquement `components/patient-form/` (renommer vers `components/hds/patients/PatientForm/`)

**Déplacer composants HDS** :
- `components/patients/` → `components/hds/patients/`
- `components/appointments/` → `components/hds/appointments/`
- `components/invoices/` → `components/hds/invoices/`

#### Phase 4 - Clés localStorage/OPFS

**Prefixer toutes les clés** :
- `{id}_patients.hds` → `hds_v1_patients_{id}.encrypted`
- `{id}_appointments.hds` → `hds_v1_appointments_{id}.encrypted`
- `selectedCabinetId` → `app_selected_cabinet_id`
- `hds-storage-skip` → `app_hds_storage_skip`

**Raison** :
- Éviter collisions
- Versioning (v1, v2...)
- Clarté

---

## 8. REMOVE_LIST

### 🔴 Fichiers à SUPPRIMER (Phase 1 URGENT)

#### Pages de debug

- ❌ `src/pages/AdminTechDebugPage.tsx`
- ❌ `src/pages/DebugAuthPage.tsx`
- ❌ `src/pages/SecurityAuditPage.tsx`
- ❌ `src/pages/UserJourneyVisualizationPage.tsx`
- ❌ `src/pages/ConfigurationPage.tsx` (si debug)

**Action** : Déplacer vers `src/__dev__/pages/` ou supprimer

#### Services dupliqués

- ❌ `src/services/supabase-api/invoice-service.ts` (utilise Supabase pour HDS !)
- ❌ Vérifier autres doublons dans `supabase-api/`

#### Composants dupliqués

- ❌ `src/components/PatientForm.tsx` (si doublon de `patient-form/`)
- ❌ `src/components/forms/FormPatient.tsx` (si doublon)
- ❌ `src/components/forms/FormAppointment.tsx` (si doublon)

#### Edge Functions supprimées (déjà fait ✅)

- ✅ `supabase/functions/patient/` - SUPPRIMÉ
- ✅ `supabase/functions/appointment/` - SUPPRIMÉ
- ✅ `supabase/functions/consultation/` - SUPPRIMÉ

---

### ⚠️ Fichiers à ARCHIVER (déplacer vers `__archive__/`)

#### Pages peu utilisées

- ⚠️ `src/pages/TipsPage.tsx` - Conseils (utilisé ?)
- ⚠️ `src/pages/PricingPage.tsx` - Tarifs (si pas de pricing actif)
- ⚠️ `src/pages/PlanSelectionPage.tsx` - Sélection plan (implémenté ?)

**Action** : Vérifier usage analytics, puis archiver si < 1% trafic

---

## 9. SECURITY_LIST

### 🔴 Risques CRITIQUES + Actions

#### Risque 1 - invoice-service.ts utilise Supabase

**Problème** :
- `src/services/supabase-api/invoice-service.ts` transmet factures vers Supabase
- Factures = HDS (lien patient) → Doit être 100% local

**Preuve** :
```typescript
// src/services/supabase-api/invoice-service.ts:212
const { data, error } = await supabase
  .from("Invoice")
  .insert(dataForDb)
```

**Impact** : 🔴 VIOLATION HDS - Données sensibles dans cloud

**Correction** :
1. Vérifier tous les usages de `invoice-service.ts`
2. Migrer vers `hds-secure-invoice-service.ts`
3. Supprimer `supabase-api/invoice-service.ts`
4. Vérifier table `Invoice` dans Supabase (doit être vide ou supprimée)

**Effort** : 2-3h

---

#### Risque 2 - Clés localStorage non prefixées

**Problème** :
- Clés comme `selectedCabinetId`, `hds-storage-skip` peuvent avoir collisions
- Difficile de versionner

**Impact** : ⚠️ MOYENNE - Risque de collision ou perte données

**Correction** :
1. Préfixer toutes les clés : `app_*`, `hds_v1_*`
2. Migration localStorage des clés existantes
3. Ajouter versioning

**Effort** : 4h

---

#### Risque 3 - Console.log résiduels

**Problème** :
- Estimé ~50-100 console.log dans le code
- Certains peuvent logger données sensibles

**Impact** : 🟡 MOYENNE-HAUTE - Fuite potentielle en logs

**Correction** :
1. Grep complet : `grep -r "console\.log" src/`
2. Classifier : bénin / ID / données
3. Supprimer logs sensibles
4. ESLint rule `no-console` en prod

**Effort** : 3h

---

#### Risque 4 - Imports Supabase dans composants

**Problème** :
- Certains composants importent `@supabase/supabase-js` directement
- Risque d'appels accidentels depuis UI

**Impact** : ⚠️ MOYENNE - Risque d'appel non contrôlé

**Correction** :
1. Grep imports : `grep -r "from '@supabase" src/components/`
2. Refactoriser pour utiliser services uniquement
3. ESLint rule interdisant imports Supabase dans `components/hds/`

**Effort** : 2h

---

#### Risque 5 - Composants dupliqués (PatientForm x3)

**Problème** :
- 3 versions de PatientForm
- Risque d'utiliser mauvaise version (avec fuite Supabase ?)

**Impact** : ⚠️ MOYENNE - Confusion, risque erreur

**Correction** :
1. Identifier version utilisée en production
2. Supprimer les 2 autres versions
3. Consolider en une seule

**Effort** : 2h

---

## 10. CODE_ACTIONS

### Actions concrètes ordonnées

#### SESSION 1 - Sécurité CRITIQUE (4h) 🔴

**Action 1.1** : Migrer invoice-service (2h)
```bash
# 1. Vérifier usages
grep -r "invoice-service" src/

# 2. Remplacer par hds-secure-invoice-service
# (modification fichiers)

# 3. Supprimer ancien service
rm src/services/supabase-api/invoice-service.ts

# 4. Vérifier table Supabase Invoice
# (Supabase Dashboard)
```

**Action 1.2** : Supprimer pages debug (1h)
```bash
# Déplacer vers __dev__/
mkdir -p src/__dev__/pages
mv src/pages/AdminTechDebugPage.tsx src/__dev__/pages/
mv src/pages/DebugAuthPage.tsx src/__dev__/pages/
mv src/pages/SecurityAuditPage.tsx src/__dev__/pages/
mv src/pages/UserJourneyVisualizationPage.tsx src/__dev__/pages/

# Mettre à jour routes
# (modifier App.tsx ou routing)
```

**Action 1.3** : Nettoyer console.log sensibles (1h)
```bash
# Grep complet
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" > console_log_audit.txt

# Analyser manuellement
# Supprimer logs sensibles
```

---

#### SESSION 2 - Organisation dossiers (6h) 🟡

**Action 2.1** : Créer nouvelle structure (2h)
```bash
# Créer dossiers HDS
mkdir -p src/pages/hds/{patients,appointments,invoices,consultations}
mkdir -p src/components/hds/{patients,appointments,invoices,consultations,files}
mkdir -p src/services/hds
mkdir -p src/hooks/hds
mkdir -p src/types/hds

# Créer dossiers cloud
mkdir -p src/pages/cloud/{cabinets,profile,team}
mkdir -p src/components/cloud/{cabinets,profile,team}
mkdir -p src/services/cloud
mkdir -p src/hooks/cloud
mkdir -p src/types/cloud
```

**Action 2.2** : Déplacer pages HDS (2h)
```bash
# Patients
mv src/pages/PatientsPage.tsx src/pages/hds/patients/ListPage.tsx
mv src/pages/NewPatientPage.tsx src/pages/hds/patients/NewPage.tsx
mv src/pages/EditPatientPage.tsx src/pages/hds/patients/EditPage.tsx
mv src/pages/PatientDetailPage.tsx src/pages/hds/patients/DetailPage.tsx

# Appointments (idem)
# Invoices (idem)

# Mettre à jour imports dans toute l'app
```

**Action 2.3** : Déplacer composants (2h)
```bash
# Déplacer composants HDS
mv src/components/patients src/components/hds/
mv src/components/appointments src/components/hds/
mv src/components/invoices src/components/hds/

# Mettre à jour imports
```

---

#### SESSION 3 - Renommage (4h) 🟡

**Action 3.1** : Renommer services HDS (1h)
```bash
# Renommer
mv src/services/hds-secure-storage/hds-secure-patient-service.ts \
   src/services/hds/patient-service.ts

# Idem pour appointment, invoice, manager

# Mettre à jour tous les imports
```

**Action 3.2** : Préfixer clés localStorage (2h)
```typescript
// Migration localStorage
const migrations = {
  'selectedCabinetId': 'app_selected_cabinet_id',
  'hds-storage-skip': 'app_hds_storage_skip',
  // ... autres clés
};

// Script migration
Object.entries(migrations).forEach(([old, new]) => {
  const value = localStorage.getItem(old);
  if (value) {
    localStorage.setItem(new, value);
    localStorage.removeItem(old);
  }
});
```

**Action 3.3** : Consolider PatientForm (1h)
```bash
# Garder une seule version
# Supprimer les autres
rm src/components/PatientForm.tsx
rm src/components/forms/FormPatient.tsx

# Garder components/patient-form/ (renommer vers hds/patients/)
```

---

#### SESSION 4 - Validation (2h) ✅

**Action 4.1** : Tests validation (1h)
- Tester création patient/RDV/facture
- Vérifier DevTools Network (0 requête HDS)
- Vérifier OPFS stockage

**Action 4.2** : ESLint rules (1h)
```json
// .eslintrc.json
{
  "rules": {
    "no-console": "error",
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["**/cloud/*", "**/supabase/*"],
            "message": "HDS files cannot import cloud services"
          }
        ]
      }
    ]
  }
}
```

---

## 11. PRIORITY_PLAN

### 🎯 Plan priorisé par Phase

#### PHASE 1 - SÉCURITÉ & VALIDATION (URGENT) 🔴

**Durée** : 1.5 jours (11h)
**Priorité** : CRITIQUE

**Tâches** :
1. ✅ Tests validation (2h) - **DÉJÀ EN COURS**
2. ✅ Migration Supabase tables HDS (3h) - **MIGRATION CRÉÉE**
3. ✅ Anonymiser audit_logs (2h) - **MIGRATION CRÉÉE**
4. 🔴 Migrer invoice-service vers HDS (2h) - **À FAIRE MAINTENANT**
5. 🔴 Supprimer pages debug (1h) - **À FAIRE**
6. 🔴 Nettoyer console.log (1h) - **À FAIRE**

**Critères succès** :
- ✅ ZÉRO donnée HDS dans Supabase
- ✅ ZÉRO page debug en prod
- ✅ ZÉRO console.log sensible

---

#### PHASE 2 - DÉVELOPPEMENT FONCTIONNALITÉS 🔴

**Durée** : 5.5 jours (44h)
**Priorité** : HAUTE

**Tâches** :
1. Créer types Consultation/CR (2h)
2. Créer service HDS Consultation (6h)
3. Créer service HDS Files (12h)
4. Créer UI Consultation/CR (12h)
5. Créer UI Fichiers (8h)
6. Photo profil patient (4h)

**Critères succès** :
- ✅ CR séance fonctionnel (local chiffré)
- ✅ Upload photos/PDF (local chiffré)
- ✅ Photo profil patient

---

#### PHASE 3 - ORGANISATION & UX 🟡

**Durée** : 4 jours (32h)
**Priorité** : MOYENNE

**Tâches** :
1. Réorganiser structure dossiers (6h)
2. Renommer services/composants (4h)
3. Consolider composants dupliqués (2h)
4. Préfixer clés localStorage (2h)
5. Améliorer landing page (4h)
6. Backup/Restauration (8h)
7. Optimiser performance OPFS (6h)

**Critères succès** :
- ✅ Structure claire HDS/cloud
- ✅ Pas de doublons
- ✅ Backup fonctionnel

---

#### PHASE 4 - GO-TO-MARKET 🟢

**Durée** : 2 jours (14h)
**Priorité** : NORMALE

**Tâches** :
1. Recruter 5 bêta-testeurs (4h)
2. Documentation utilisateur (6h)
3. Analytics anonymisés (4h)

**Critères succès** :
- ✅ 5 bêta-testeurs actifs
- ✅ Documentation complète
- ✅ Métriques anonymes

---

## 📊 RÉSUMÉ ACTIONS IMMÉDIATES

### 🔥 À FAIRE MAINTENANT (aujourd'hui)

1. **Migrer invoice-service** (2h) 🔴
   - Remplacer par hds-secure-invoice-service
   - Supprimer ancien fichier
   - Vérifier table Supabase

2. **Supprimer pages debug** (1h) 🔴
   - Déplacer vers `__dev__/`
   - Mettre à jour routes

3. **Nettoyer console.log** (1h) 🔴
   - Grep complet
   - Supprimer logs sensibles

**TOTAL** : 4h

---

## ✅ CHECKLIST CONFORMITÉ FINALE

Après toutes les actions, vérifier :

- [ ] ZÉRO table HDS dans Supabase
- [ ] ZÉRO service `supabase-api/` pour données HDS
- [ ] ZÉRO page debug en production
- [ ] ZÉRO console.log de données sensibles
- [ ] ZÉRO import Supabase dans `components/hds/`
- [ ] Tous services HDS dans `services/hds/`
- [ ] Tous services cloud dans `services/cloud/`
- [ ] Clés localStorage prefixées
- [ ] ESLint rules activées
- [ ] Tests validation passent

---

**Dernière mise à jour** : 17 Janvier 2026
**Prêt pour exécution** : OUI ✅
**Prochaine action** : Migrer invoice-service (2h)
