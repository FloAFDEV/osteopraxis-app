# Tests E2E OstéoPraxis

Tests end-to-end avec Playwright pour valider les parcours utilisateurs critiques.

## Installation

```bash
npm install
npx playwright install
```

## Lancer les tests

```bash
# Tous les tests (headless)
npm run test:e2e

# Mode UI (interface graphique)
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (pas à pas)
npm run test:e2e:debug

# Voir le rapport
npm run test:e2e:report
```

## Tests disponibles

### 1. `registration-flow.spec.ts`
Tests du parcours d'inscription complet:
- ✅ Inscription → Redirection vers /hds-setup
- ✅ Pas de redirect vers /login après inscription
- ✅ Validation des erreurs de formulaire

### 2. `demo-to-active-flow.spec.ts`
Tests du cycle de vie ostéopathe DEMO → ACTIF:
- ✅ Nouveau compte démarre en mode DEMO
- ✅ Badge de statut visible sur le dashboard
- ⏳ Filigrane "NON VALABLE" sur les factures PDF (mode DEMO)
- ⏳ Activation par admin (requiert compte admin configuré)
- ⏳ Pas de filigrane après activation

## Architecture testée

```
Register → HDS Setup → Dashboard
   ↓
User + Osteopath créés (trigger SQL)
   ↓
Osteopath.status = 'demo'
   ↓
Admin active → status = 'active'
   ↓
PDF sans filigrane
```

## Configuration

Voir `playwright.config.ts` pour:
- Base URL (défaut: http://localhost:5173)
- Navigateurs testés (Chromium, Firefox, WebKit)
- Timeouts et retries
- Screenshots et vidéos d'échec

## CI/CD

Pour exécuter en CI:
```bash
CI=true npm run test:e2e
```

## Notes importantes

- Les tests créent des utilisateurs temporaires avec email `test-{timestamp}@osteopraxis-e2e.com`
- Le serveur de dev doit être lancé avant les tests (ou automatique via webServer)
- Certains tests (activation admin) nécessitent un compte admin configuré via la migration
