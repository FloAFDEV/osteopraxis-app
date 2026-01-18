# 🎯 Guide de Test - Mode Démo OstéoPraxis

## ✅ Corrections effectuées

### 1. Renommage complet "OstéoPraxis" → "OstéoPraxis"
- ✅ Tous les textes de l'interface utilisateur
- ✅ Emails démo: `demo@osteopraxis.com`
- ✅ URLs dans les QR codes des factures
- ✅ Noms de bases de données et formats de fichiers
- ✅ Clés localStorage
- ✅ Migrations SQL

### 2. Création du compte démo
- ✅ Migration SQL pour créer automatiquement le compte
- ✅ Credentials: `demo@osteopraxis.com` / `demo123456`
- ✅ Script de configuration automatique

---

## 🚀 Pour tester le mode démo (ÉTAPES À SUIVRE)

### Prérequis
1. **Docker Desktop doit être démarré**
   - Ouvrez Docker Desktop
   - Attendez qu'il soit complètement démarré (icône verte)

### Étape 1 : Configurer Supabase
```bash
# 1. Démarrer Supabase local
supabase start

# 2. Appliquer les migrations (créer le compte démo)
supabase db push

# 3. Vérifier que le compte démo existe
supabase db psql -c "SELECT email FROM auth.users WHERE email = 'demo@osteopraxis.com';"

# Si le compte n'existe pas, exécutez le script de configuration
./scripts/setup-demo.sh
```

### Étape 2 : Démarrer l'application
```bash
# Dans un nouveau terminal
npm run dev
```

### Étape 3 : Tester le mode démo
1. Ouvrez votre navigateur: `http://localhost:5173`
2. Cliquez sur **"Essayer la démo"** ou **"Essayer la démo gratuite"**
3. Vous devriez être redirigé vers `/demo`
4. Cliquez sur **"Commencer la démo"**
5. ✨ Connexion automatique avec `demo@osteopraxis.com`
6. Vous êtes redirigé vers le dashboard avec des données fictives

---

## 🧪 Parcours de test complet

### A. Mode Démo (Visiteur anonyme)
```
Credentials:
Email:    demo@osteopraxis.com
Password: demo123456
```

**Ce qu'il faut tester:**
1. ✅ Connexion depuis la landing page (bouton "Essayer la démo")
2. ✅ Navigation dans le dashboard
3. ✅ Création/modification de patients fictifs
4. ✅ Gestion du calendrier de rendez-vous
5. ✅ Génération d'une facture PDF (avec filigrane "DEMO")
6. ✅ Vérifier que les données sont temporaires (session 30 min)
7. ✅ Déconnexion et vérification que les données ne persistent pas

### B. Utilisateur enregistré (Nouveau compte)
```
Option 1: Créer votre compte via /register
Option 2: Utiliser un compte test (à créer manuellement)
```

**Ce qu'il faut tester:**
1. ✅ Inscription via `/register`
2. ✅ Wizard de première connexion (profil ostéopathe)
3. ✅ Configuration du cabinet
4. ✅ Création d'un vrai patient
5. ✅ Génération d'une facture PDF (sans filigrane si compte actif)
6. ✅ Fermer le navigateur et rouvrir → données persistent
7. ✅ Export/Import de données chiffrées (.phds)

### C. Admin (Vous - Florent)
```
Email:    afdevflo@gmail.com
Password: [votre mot de passe personnel]
```

**Ce qu'il faut tester:**
1. ✅ Connexion admin
2. ✅ Accès au dashboard admin
3. ✅ Gestion des ostéopathes (voir statuts demo/active/blocked)
4. ✅ Activation d'un compte démo → actif
5. ✅ Statistiques globales de l'application

---

## 🐛 Si le mode démo ne fonctionne pas

### Problème 1: "Erreur lors de la connexion en mode démo"
**Cause:** Le compte `demo@osteopraxis.com` n'existe pas dans Supabase

**Solution:**
```bash
# Créer le compte manuellement
supabase db psql <<EOF
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at,
    confirmation_token,
    is_sso_user
)
SELECT
    '45507f32-8613-4a0a-abd6-600b73e0369d'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'demo@osteopraxis.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    '{"is_demo": true, "is_demo_user": true}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    false
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'demo@osteopraxis.com'
);

INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    '45507f32-8613-4a0a-abd6-600b73e0369d'::uuid,
    jsonb_build_object(
        'sub', '45507f32-8613-4a0a-abd6-600b73e0369d',
        'email', 'demo@osteopraxis.com'
    ),
    'email',
    now(),
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1
    FROM auth.identities
    WHERE user_id = '45507f32-8613-4a0a-abd6-600b73e0369d'::uuid
    AND provider = 'email'
);
EOF
```

### Problème 2: "Docker daemon not running"
**Cause:** Docker Desktop n'est pas démarré

**Solution:**
1. Ouvrir Docker Desktop
2. Attendre qu'il soit complètement démarré
3. Relancer `supabase start`

### Problème 3: Le bouton "Essayer la démo" ne fonctionne pas
**Cause:** La route `/demo` ou la page `InteractiveDemoPage` a un problème

**Solution:**
1. Vérifiez la console DevTools (F12) pour les erreurs
2. Vérifiez que la route est bien définie dans `App.tsx`:
   ```tsx
   <Route path="/demo" element={<InteractiveDemoPage />} />
   ```
3. Connectez-vous manuellement via `/login` avec les credentials démo

### Problème 4: Les données démo ne se chargent pas
**Cause:** Le service `demo-local-storage` ne fonctionne pas

**Solution:**
1. Vérifiez la console pour les erreurs
2. Vérifiez que `DEMO_USER_EMAIL` est bien `demo@osteopraxis.com` dans `src/config/demo-constants.ts`
3. Inspectez IndexedDB dans DevTools → Application → Storage → IndexedDB

---

## 📊 Résumé des changements

| Ancien | Nouveau |
|--------|---------|
| `demo@patienthub.com` | `demo@osteopraxis.com` |
| `OstéoPraxis` (UI) | `OstéoPraxis` |
| `OstéoPraxis_HDS_Secure` | `OstéoPraxis_HDS_Secure` |
| `OstéoPraxisDemo` (DB) | `OstéoPraxis_Demo` |
| `patienthub_backup_*.phds` | `osteopraxis_backup_*.phds` |
| `patienthub-geolocation-enabled` | `osteopraxis-geolocation-enabled` |
| `https://patienthub.com/verify/` | `https://osteopraxis.com/verify/` |

---

## ✅ Checklist de vérification

Avant de considérer que tout fonctionne, vérifiez:

- [ ] Docker Desktop est démarré
- [ ] Supabase local est actif (`supabase status`)
- [ ] Le compte démo existe (`SELECT * FROM auth.users WHERE email = 'demo@osteopraxis.com';`)
- [ ] L'app démarre sans erreur (`npm run dev`)
- [ ] La landing page affiche "OstéoPraxis" (pas "OstéoPraxis")
- [ ] Le bouton "Essayer la démo" redirige vers `/demo`
- [ ] La page `/demo` affiche "Démo Interactive OstéoPraxis"
- [ ] Cliquer sur "Commencer la démo" connecte automatiquement
- [ ] Le dashboard s'affiche avec des données fictives
- [ ] Les factures PDF générées affichent "OstéoPraxis" (pas "OstéoPraxis")
- [ ] Le filigrane "DEMO" apparaît sur les factures en mode démo

---

## 🎉 Prochaines étapes

Une fois le mode démo fonctionnel:

1. **Tester tous les parcours** (démo, user, admin)
2. **Vérifier le branding** (logos, couleurs, noms)
3. **Tester sur différents navigateurs** (Chrome, Firefox, Safari)
4. **Vérifier la persistance des données** (compte réel)
5. **Tester l'export/import de données chiffrées**
6. **Valider le processus d'inscription complet**

---

**Bon test ! 🚀**

Si vous rencontrez des problèmes, consultez les logs:
- Console navigateur (F12)
- Terminal où tourne `npm run dev`
- Logs Supabase: `supabase logs`
