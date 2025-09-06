# 🏗️ Architecture de Stockage Hybride - PatientHub

## 📋 Vue d'ensemble

PatientHub utilise une architecture de stockage hybride sécurisée qui respecte la réglementation HDS (Hébergement de Données de Santé) française.

## 🎯 Principe de Routage Automatique

Le système route automatiquement les données selon leur classification et le mode utilisateur :

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Utilisateur   │───▶│  StorageRouter   │───▶│   Destination   │
│                 │    │                  │    │                 │
│ Mode démo       │    │ Classification   │    │ sessionStorage  │
│ Mode connecté   │    │ HDS / Non-HDS    │    │ localStorage    │
│                 │    │                  │    │ Supabase cloud  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 Classification des Données

### 🔴 Données HDS (Sensibles)
**Stockage obligatoire : Local persistant sécurisé**
- `patients` - Informations patients
- `appointments` - Rendez-vous
- `invoices` - Factures
- `medical_records` - Dossiers médicaux
- `patient_documents` - Documents patients
- `appointment_notes` - Notes de consultation
- `billing_data` - Données de facturation

### 🟢 Données Non-HDS
**Stockage autorisé : Supabase cloud**
- `user_preferences` - Préférences utilisateur
- `system_settings` - Paramètres système
- `audit_logs` - Logs d'audit
- `osteopaths` - Profils ostéopathes
- `cabinets` - Informations cabinets
- `users` - Comptes utilisateurs
- `subscriptions` - Abonnements

## 🚦 Modes de Fonctionnement

### 🎭 Mode Démo
```typescript
// Détection automatique
if (await isDemoSession()) {
  // TOUTES les données → sessionStorage éphémère
  // Suppression automatique à la fermeture de l'onglet
  // Aucun risque de persistance non désirée
}
```

**Caractéristiques :**
- ✅ Isolation complète
- ✅ Données éphémères (sessionStorage)
- ✅ Suppression automatique
- ✅ Aucun impact sur les données réelles

### 👤 Mode Connecté (Utilisateur Réel)
```typescript
// Routage selon classification HDS
const classification = getDataClassification(dataType);

if (classification === 'HDS') {
  // → Stockage local persistant sécurisé
  // → Chiffrement AES-256-GCM
  // → Export/import contrôlé
} else {
  // → Supabase cloud
  // → Synchronisation temps réel
  // → Backup automatique
}
```

**Caractéristiques :**
- 🔒 Données HDS : Stockage local obligatoire
- ☁️ Données Non-HDS : Cloud Supabase
- 🔐 Chiffrement des données sensibles
- 📤 Export sécurisé possible

## 🛠️ Utilisation du StorageRouter

### Interface Unifiée
```typescript
import { storageRouter } from '@/services/storage/storage-router';

// Le routeur détermine automatiquement la destination
const adapter = await storageRouter.route<Patient>('patients');

// API uniforme pour toutes les opérations
const patients = await adapter.getAll();
const patient = await adapter.getById(1);
const newPatient = await adapter.create(patientData);
const updated = await adapter.update(1, changes);
const deleted = await adapter.delete(1);
```

### Services API Simplifiés
```typescript
// Exemple : Patient Service
export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const adapter = await storageRouter.route<Patient>('patients');
    return adapter.getAll(); // HDS → Local, Demo → sessionStorage
  },
  
  async createPatient(data: PatientData): Promise<Patient> {
    const adapter = await storageRouter.route<Patient>('patients');
    return adapter.create(data); // Routage automatique sécurisé
  }
};
```

## 🔒 Sécurité et Conformité

### Protection HDS
```typescript
// Validation automatique - Aucune donnée HDS ne peut fuiter
validateHDSSecurityPolicy(dataType, 'supabase'); // Lève une exception si violation

// Exemple d'erreur de sécurité :
// 🚨 VIOLATION SÉCURITÉ HDS: Les données "patients" sont classées HDS 
// et ne peuvent pas être stockées sur Supabase. Utilisation du stockage local obligatoire.
```

### Configuration de Sécurité HDS
```typescript
export const HDS_SECURITY_CONFIG = {
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2'
  },
  export: {
    requiresUserConsent: true,
    encryptionRequired: true,
    auditRequired: true
  },
  access: {
    localOnly: true,
    noCloudSync: true,
    requiresAuthentication: true
  }
} as const;
```

## 📈 Diagnostic et Monitoring

### Diagnostic Système
```typescript
import { storageDiagnostic } from '@/services/storage/storage-diagnostic';

// Diagnostic complet
const report = await storageDiagnostic.runFullDiagnostic();

// Validation de l'intégrité
const { isValid, issues, recommendations } = await storageDiagnostic.validateSystemIntegrity();

// Export pour debugging
const diagnosticReport = await storageDiagnostic.exportDiagnostic();
```

### Hook de Diagnostic React
```typescript
import { useStorageDiagnostic } from '@/services/storage/storage-diagnostic';

function DiagnosticPanel() {
  const { runDiagnostic, validateSystem } = useStorageDiagnostic();
  
  const checkSystem = async () => {
    const diagnostic = await runDiagnostic();
    console.table(diagnostic);
  };
}
```

## 🔧 Migration depuis l'Ancienne Architecture

### Avant (Code mort supprimé)
```typescript
// ❌ Code supprimé
const USE_SUPABASE = true;
if (USE_SUPABASE) { /* logique conditionnelle */ }

// ❌ Code supprimé  
setDemoContext(demoData);
```

### Après (Architecture hybride)
```typescript
// ✅ Routage automatique
const adapter = await storageRouter.route('patients');
// Le système détermine automatiquement :
// - Mode démo → demo-local-storage
// - Mode connecté + HDS → hds-local-storage
// - Mode connecté + Non-HDS → supabase
```

## 📚 Exemples d'Utilisation

### Création d'un Patient (HDS)
```typescript
// Mode démo : sessionStorage éphémère
// Mode connecté : stockage local sécurisé avec chiffrement
const adapter = await storageRouter.route<Patient>('patients');
const patient = await adapter.create({
  firstName: 'Jean',
  lastName: 'Dupont',
  birthDate: '1985-05-15',
  // ... autres données HDS
});
```

### Gestion d'un Cabinet (Non-HDS)
```typescript
// Mode démo : sessionStorage éphémère
// Mode connecté : Supabase cloud avec sync temps réel
const adapter = await storageRouter.route<Cabinet>('cabinets');
const cabinet = await adapter.create({
  name: 'Cabinet Santé',
  address: '123 Rue de la Paix',
  // ... autres données non-HDS
});
```

## 🎯 Avantages de l'Architecture

### ✅ Sécurité
- ✅ Respect total de la réglementation HDS
- ✅ Aucune fuite de données sensibles vers le cloud
- ✅ Chiffrement automatique des données locales
- ✅ Isolation complète du mode démo

### ✅ Simplicité
- ✅ API uniforme pour tous les services
- ✅ Routage automatique transparent
- ✅ Pas de logique conditionnelle dans l'application
- ✅ Code plus maintenable et testable

### ✅ Performance
- ✅ Données sensibles en local = accès instantané
- ✅ Données non-sensibles en cloud = synchronisation
- ✅ Mode démo = performances optimales (sessionStorage)
- ✅ Gestion automatique du cache

### ✅ Fiabilité
- ✅ Validation stricte des classifications
- ✅ Diagnostic intégré pour monitoring
- ✅ Export/import sécurisé des données HDS
- ✅ Gestion d'erreur robuste

## 🛡️ Conformité Réglementaire

Cette architecture garantit :
- **HDS** : Hébergement de Données de Santé (France)
- **RGPD** : Règlement Général sur la Protection des Données
- **Code de la santé publique** : Respect des obligations légales

Les données de santé ne quittent jamais l'appareil de l'utilisateur en mode connecté, garantissant une conformité totale avec la réglementation française.