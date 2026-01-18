# OstéoPraxis - Logiciel Professionnel pour Cabinets d'Ostéopathie

Application de gestion de cabinet d'ostéopathie avec **architecture hybride sécurisée** :
- 🔐 **Données sensibles** : 100% stockage local chiffré (aucun cloud)
- ☁️ **Auth & profils** : Cloud Supabase (non-sensible)

## 🎯 Objectif

Créer une solution de gestion qui **évite l'obligation d'hébergement HDS certifié** en stockant toutes les données de santé exclusivement en local (navigateur).

## 🏗️ Architecture Hybride

### Cloud (Supabase) - Données NON-HDS uniquement
- ✅ Authentification (JWT, OAuth Google)
- ✅ Profils ostéopathes
- ✅ Cabinets (adresses, horaires)
- ✅ Préférences utilisateur

### Local (OPFS chiffré AES-256-GCM) - Données HDS
- 🔐 Patients (identité, anamnèse complète)
- 🔐 Rendez-vous (motifs, notes séances)
- 🔐 Consultations
- 🔐 Factures
- 🔐 Documents médicaux

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ & npm
- Navigateur moderne (Chrome, Firefox, Edge)

### Installation

```bash
# Cloner le repository
git clone <YOUR_GIT_URL>
cd osteopraxis-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en développement
npm run dev
```

### Supabase Setup

```bash
# Installer Supabase CLI
npm install -g supabase

# Démarrer Supabase local
supabase start

# Appliquer les migrations
supabase db push

# Déployer les Edge Functions
supabase functions deploy
```

## 🔐 Sécurité & Conformité

### Chiffrement
- **Algorithm** : AES-256-GCM
- **Key derivation** : PBKDF2 (150,000 iterations, SHA-256)
- **Integrity** : HMAC-SHA256
- **Storage** : OPFS (Origin Private File System) ou IndexedDB fallback

### Conformité RGPD/HDS
- ✅ Données de santé 100% locales (pas d'hébergement HDS requis)
- ✅ Chiffrement bout-en-bout
- ✅ Password en RAM uniquement (jamais persisté)
- ✅ Export/suppression données utilisateur
- ✅ Audit logs anonymisés

## 📋 Fonctionnalités

### ✅ Actuellement disponibles
- Gestion patients (anamnèse complète 50+ champs)
- Calendrier rendez-vous (jour/semaine/mois)
- Facturation automatique PDF
- Multi-cabinets
- Mode démo (30 min, données fictives)
- Import/Export données
- Dashboard statistiques

### 🚧 En développement (Phase 2)
- Comptes-rendus de séance structurés
- Gestion fichiers (photos/PDF) chiffrés
- Photo profil patient
- Backup/Restauration manuel

## 📁 Structure du projet

```
src/
├── pages/              # Pages React (routes)
├── components/         # Composants réutilisables
│   ├── hds/           # Composants données sensibles
│   ├── ui/            # UI générique (shadcn/ui)
│   └── ...
├── services/
│   ├── hds-secure-storage/  # Stockage local chiffré
│   ├── supabase-api/        # Services cloud (non-HDS)
│   └── ...
├── hooks/              # React hooks
├── contexts/           # React contexts
└── types/              # TypeScript types

supabase/
├── functions/          # Edge Functions (Deno)
└── migrations/         # Migrations SQL
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Audit sécurité
npm run audit
```

## 🚢 Déploiement

```bash
# Build production
npm run build

# Preview build
npm run preview

# Déployer (Vercel/Netlify)
npm run deploy
```

## 🔧 Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : TailwindCSS + shadcn/ui (Radix UI)
- **Backend** : Supabase (PostgreSQL + Edge Functions)
- **Auth** : Supabase Auth (JWT, OAuth Google)
- **Storage** : OPFS (File System Access API) + IndexedDB fallback
- **Crypto** : Web Crypto API (AES-256-GCM)
- **Forms** : React Hook Form + Zod
- **State** : React Context + TanStack Query

## 📊 Statut du projet

**Version** : 1.0.0-beta
**Statut** : Phase 1 (Validation & Sécurité) ✅
**Prochaine** : Phase 2 (CR séances + Fichiers)

## 📝 Licence

Propriétaire - Tous droits réservés

## 🤝 Contribuer

Ce projet est actuellement en développement privé.

## 📧 Contact

Pour toute question : [contact@osteopraxis.fr](mailto:contact@osteopraxis.fr)

---

**⚠️ Note importante** : Ce projet vise explicitement à éviter l'obligation d'hébergement HDS certifié en stockant toutes les données de santé exclusivement en local. Toute modification de l'architecture doit maintenir cette séparation stricte cloud/local.
