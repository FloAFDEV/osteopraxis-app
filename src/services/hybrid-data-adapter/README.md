# Système de Stockage Hybride HDS - OstéoPraxis

## Vue d'ensemble

Le système de stockage hybride de OstéoPraxis assure la **conformité HDS** en stockant automatiquement les données sensibles localement et les données non-sensibles dans le cloud.

## ✅ Configuration Automatique

Le système s'initialise automatiquement au démarrage de l'application via `OstéoPraxisInitializer` dans `App.tsx`.

### Classification automatique des données :

**📦 Stockage Local (HDS Sensible)**
- `patients` - Données patients
- `appointments` - Rendez-vous
- `invoices` - Factures

**☁️ Stockage Cloud (Non-sensible)**
- `users` - Comptes utilisateurs
- `osteopaths` - Profils ostéopathes
- `cabinets` - Informations cabinets
- `quotes` - Devis
- `consultations` - Notes de consultation

## 🎭 Modes de Fonctionnement

### Mode Production (Utilisateur connecté)
- **Données sensibles** → Stockage local (IndexedDB/SQLite)
- **Données non-sensibles** → Supabase
- **Conformité HDS** ✅

### Mode Démo
- **Toutes les données** → SessionStorage éphémère
- **Suppression automatique** après 30 minutes
- **Isolation par session** ✅

## 🚀 Utilisation

### Initialization (Déjà configurée)

Le système s'initialise automatiquement dans `App.tsx` :

```tsx
// Dans App.tsx - DÉJÀ CONFIGURÉ
import { OstéoPraxisInitialization } from "@/services/hybrid-data-adapter/app-initialization";

function OstéoPraxisInitializer() {
  useEffect(() => {
    OstéoPraxisInitialization.initializeApp();
  }, []);
  return null;
}
```

### Utilisation dans les services API

Les services API utilisent déjà le gestionnaire hybride :

```typescript
// Exemple : patient-service.ts
import { hybridDataManager } from "@/services/hybrid-data-adapter/hybrid-manager";

// Utilisation transparente - le système choisit automatiquement le bon stockage
const patients = await hybridDataManager.get<Patient>('patients');
const patient = await hybridDataManager.create<Patient>('patients', patientData);
```

## 🛡️ Conformité HDS

### Vérification automatique

```typescript
import { HDSInitialization } from '@/services/hybrid-data-adapter/hds-initialization';

// Diagnostic complet
const diagnosis = await HDSInitialization.diagnose();
console.log('Conformité HDS:', diagnosis.compliance);
```

### Composant de surveillance

```tsx
import { HDSComplianceIndicator } from '@/components/hds/HDSComplianceIndicator';

// Affiche l'état de conformité en temps réel
<HDSComplianceIndicator />
```

## 📋 API Disponible

### Gestionnaire principal

```typescript
import { hybridDataManager } from '@/services/hybrid-data-adapter/hybrid-manager';

// Opérations CRUD automatiques
const items = await hybridDataManager.get<T>('entityName');
const item = await hybridDataManager.getById<T>('entityName', id);
const created = await hybridDataManager.create<T>('entityName', data);
const updated = await hybridDataManager.update<T>('entityName', id, data);
const deleted = await hybridDataManager.delete('entityName', id);

// Statut du stockage
const status = await hybridDataManager.getStorageStatus();

// Export/Import
const backup = await hybridDataManager.exportData();
await hybridDataManager.importData(backupPath, password);
```

### Initialisation

```typescript
import { OstéoPraxisInitialization } from '@/services/hybrid-data-adapter/app-initialization';

// Initialisation complète (déjà dans App.tsx)
await OstéoPraxisInitialization.initializeApp();

// Diagnostic
const isReady = OstéoPraxisInitialization.isReady;

// Réinitialisation (changement de mode)
await OstéoPraxisInitialization.reinitialize();
```

## 🔧 Pages d'administration

### Page de configuration
- **URL** : `/settings/storage` (Admin uniquement)
- **Fonctionnalités** :
  - Indicateur de conformité HDS
  - Statut du stockage en temps réel
  - Export/Import des données
  - Diagnostic système

### Page de diagnostic
- **URL** : `/admin/storage-diagnostic`
- **Fonctionnalités** :
  - Tests de performance
  - Vérification des adaptateurs
  - Logs système

## 🎯 Avantages

✅ **Configuration automatique** - Aucune intervention manuelle
✅ **Conformité HDS garantie** - Données sensibles toujours locales
✅ **Mode démo isolé** - Sessions éphémères sécurisées  
✅ **API transparente** - Pas de changement dans le code métier
✅ **Fallback intelligent** - Graceful degradation en cas d'erreur
✅ **Monitoring temps réel** - Indicateurs de santé système

## 🔄 Migration des données

Le système peut migrer automatiquement les données du cloud vers le local :

```typescript
// Migration manuelle (si nécessaire)
const result = await hybridDataManager.syncCloudToLocal('patients');
console.log(`${result.migrated} patients migrés`);
```

## 📱 UX améliorée

### Formulaire patient intelligent
- **Cabinet unique** → Sélection automatique (pas de select)
- **Plusieurs cabinets** → Menu déroulant
- **UX optimisée** selon le contexte

## 🚨 Alertes système

Le système affiche automatiquement :
- ✅ Mode conforme HDS
- ⚠️ Problèmes de stockage local
- 🎭 Mode démo actif
- 📊 Statut des adaptateurs

## 📝 Logs système

Tous les événements sont loggés avec préfixes visuels :
- 🏥 Initialisation système
- 🎭 Mode démo
- 📦 Configuration adaptateurs
- ✅ Succès opérations
- ❌ Erreurs système

## 🔐 Sécurité

- **Chiffrement** des données locales
- **Isolation** des sessions démo
- **Audit trail** des accès admin
- **Validation** des permissions

Le système est maintenant **prêt à l'emploi** et entièrement configuré dans OstéoPraxis ! 🚀