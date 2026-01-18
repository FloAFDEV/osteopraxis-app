# 🧹 AUDIT FRONT - RÉSUMÉ EXÉCUTIF

**Date** : 17 Janvier 2026
**Pages** : 49 | **Composants** : 31 dossiers | **Status** : Besoin nettoyage

---

## 🔴 PROBLÈMES CRITIQUES (À CORRIGER MAINTENANT)

### 1. `invoice-service.ts` utilise encore Supabase 🔴
- **Fichier** : `src/services/supabase-api/invoice-service.ts`
- **Problème** : Transmet factures (HDS) vers Supabase cloud
- **Action** : Migrer vers `hds-secure-invoice-service.ts` + supprimer ancien

### 2. Pages debug en production 🔴
- `AdminTechDebugPage.tsx`
- `DebugAuthPage.tsx`
- `SecurityAuditPage.tsx`
- `UserJourneyVisualizationPage.tsx`
- **Action** : Déplacer vers `src/__dev__/` ou supprimer

### 3. Console.log résiduels ⚠️
- ~50-100 `console.log` dans le code
- Certains peuvent logger données sensibles
- **Action** : Grep + nettoyer + ESLint rule

---

## 🟡 ORGANISATION À AMÉLIORER

### 4. Structure dossiers mélangée
- HDS et non-HDS mélangés
- **Recommandation** : Séparer en `/hds/` et `/cloud/`

### 5. Composants dupliqués
- **3 versions** de PatientForm
- 2 versions AppointmentForm
- **Action** : Consolider en une seule version

### 6. Clés localStorage non prefixées
- `selectedCabinetId` → `app_selected_cabinet_id`
- Risque collision/versioning
- **Action** : Préfixer toutes les clés

---

## ✅ STRUCTURE CIBLE RECOMMANDÉE

```
src/
├── pages/
│   ├── hds/              # Pages données sensibles (patients, RDV, factures)
│   ├── cloud/            # Pages cloud (cabinets, profils)
│   └── __dev__/          # Pages debug (exclu production)
│
├── components/
│   ├── hds/              # Composants HDS uniquement
│   ├── cloud/            # Composants cloud uniquement
│   └── ui/               # UI générique
│
├── services/
│   ├── hds/              # Services locaux (patients, RDV, etc.)
│   └── cloud/            # Services Supabase (auth, cabinets)
```

**Règle** : Fichiers `hds/` **NE PEUVENT PAS** importer Supabase

---

## 🎯 PLAN D'ACTION CONCIS

### Phase 1 - URGENT (4h)
1. Migrer `invoice-service.ts` (2h)
2. Supprimer pages debug (1h)
3. Nettoyer console.log (1h)

### Phase 2 - Organisation (6h)
4. Créer structure `/hds/` et `/cloud/` (2h)
5. Déplacer pages/composants (2h)
6. Consolider PatientForm (1h)
7. Préfixer clés localStorage (1h)

### Phase 3 - Validation (1h)
8. Tests + ESLint rules

**TOTAL** : 11h

---

## 📋 ACTIONS IMMÉDIATES

**À FAIRE AUJOURD'HUI** :

```bash
# 1. Migrer invoice-service
grep -r "invoice-service" src/  # Vérifier usages
# Remplacer par hds-secure-invoice-service
rm src/services/supabase-api/invoice-service.ts

# 2. Supprimer pages debug
mkdir -p src/__dev__/pages
mv src/pages/*Debug*.tsx src/__dev__/pages/
mv src/pages/*Audit*.tsx src/__dev__/pages/

# 3. Nettoyer logs
grep -r "console\.log" src/ > logs_audit.txt
# Analyser + supprimer logs sensibles
```

**TEMPS TOTAL** : 4h

---

## ✅ CHECKLIST POST-NETTOYAGE

- [ ] ZÉRO service Supabase pour HDS
- [ ] ZÉRO page debug en prod
- [ ] ZÉRO console.log sensible
- [ ] Structure `/hds/` et `/cloud/` créée
- [ ] Clés localStorage prefixées
- [ ] ESLint rules activées

---

**Prochaine étape** : Exécuter Phase 1 (4h)
