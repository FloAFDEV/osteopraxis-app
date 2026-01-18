# 🔐 Credentials de Test - OstéoPraxis

## 📋 Vue d'ensemble des parcours utilisateurs

Ce document vous permet de tester tous les parcours utilisateurs de l'application OstéoPraxis.

---

## 🎭 1. MODE DÉMO (Visiteur anonyme)

### Accès
- **URL**: Landing page → Bouton "Essayer la démo"
- **Durée**: 30 minutes
- **Données**: Fictives, générées automatiquement
- **Stockage**: LocalStorage temporaire (effacé après expiration)

### Credentials
```
Email: demo@osteopraxis.com
Mot de passe: demo123456
```

### Ce que vous pouvez tester
- ✅ Navigation complète de l'interface
- ✅ Création/modification de patients (données fictives)
- ✅ Gestion des rendez-vous
- ✅ Génération de factures PDF
- ✅ Tableau de bord avec statistiques
- ❌ **Limitations**: Pas de sauvegarde persistante, session limitée à 30 min

### Comment tester
1. Allez sur la landing page
2. Cliquez sur "Essayer la démo gratuitement"
3. L'app se connecte automatiquement avec les credentials démo
4. Explorez toutes les fonctionnalités

---

## 👤 2. UTILISATEUR ENREGISTRÉ (Compte réel)

### Accès
- **URL**: `/register` ou `/login`
- **Données**: Persistantes, stockage local chiffré (OPFS/IndexedDB)
- **Durée**: Illimitée

### Option A: Inscription manuelle
```
Vous devez créer votre propre compte:
1. Allez sur /register
2. Remplissez le formulaire d'inscription
3. Validez votre email (si configuré)
4. Complétez le wizard de première connexion
```

### Option B: Compte de test pré-créé
```
⚠️ À CONFIGURER MANUELLEMENT
Pour créer un compte de test:

1. Via Supabase SQL Editor:
   - Allez dans votre projet Supabase
   - Exécutez cette requête:

INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'test@osteopraxis.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  now(),
  now()
);

2. Ou utilisez l'interface Supabase Auth:
   - Authentication → Users → Add user
   - Email: test@osteopraxis.com
   - Password: TestPassword123!
```

### Ce que vous pouvez tester
- ✅ Inscription complète avec wizard onboarding
- ✅ Création de profil ostéopathe
- ✅ Configuration du cabinet (adresse, horaires)
- ✅ Stockage sécurisé des données patients (chiffrement AES-256)
- ✅ Import/Export de données
- ✅ Backup/Restauration manuelle
- ✅ Multi-cabinets
- ✅ Persistance des données (même après fermeture du navigateur)

---

## 👨‍💼 3. ADMIN (Vous - Florent)

### Credentials
```
Email: afdevflo@gmail.com
Mot de passe: [Votre mot de passe personnel]
```

### Configuration
Votre compte admin est configuré via la migration:
`supabase/migrations/20250724120000_admin_bootstrap.sql`

### Privilèges spéciaux
- ✅ Accès au dashboard admin
- ✅ Gestion des utilisateurs
- ✅ Statistiques globales de l'application
- ✅ Configuration système
- ✅ Logs et monitoring (si implémenté)

### Comment tester
1. Connectez-vous avec votre email Gmail
2. Vous serez automatiquement identifié comme admin
3. Accédez aux sections admin via le menu

---

## 🔄 4. PARCOURS COMPLET RECOMMANDÉ

### Étape 1: Visiteur → Démo (5 min)
```bash
1. Lancez l'app: npm run dev
2. Naviguez sur http://localhost:5173
3. Cliquez sur "Essayer la démo"
4. Explorez l'interface avec les données fictives
```

### Étape 2: Inscription nouveau compte (10 min)
```bash
1. Déconnectez-vous du mode démo
2. Allez sur /register
3. Créez un compte: votre-email@example.com
4. Complétez le wizard de configuration:
   - Profil ostéopathe (nom, ADELI, RPPS)
   - Cabinet (adresse, téléphone)
   - Préférences (tarifs, horaires)
5. Créez votre premier patient
6. Générez votre première facture
```

### Étape 3: Test Admin (5 min)
```bash
1. Déconnectez-vous
2. Reconnectez-vous avec afdevflo@gmail.com
3. Vérifiez les fonctionnalités admin
4. Consultez les statistiques globales
```

---

## 🧪 5. TESTS TECHNIQUES

### Test de sécurité du stockage
```bash
# Ouvrez la console DevTools (F12)
# Vérifiez que les données patients sont chiffrées

# 1. Inspectez IndexedDB
Application → Storage → IndexedDB → OstéoPraxis-HDS-Secure

# 2. Vérifiez que les données sont illisibles
# Vous devriez voir du contenu chiffré, pas du texte clair

# 3. Testez l'export/import
- Exportez vos données (menu Paramètres → Export)
- Fichier .phds téléchargé (chiffré)
- Supprimez toutes les données
- Réimportez le fichier .phds
- Vérifiez que tout est restauré
```

### Test de la persistance
```bash
1. Créez un patient en tant qu'utilisateur enregistré
2. Fermez complètement le navigateur
3. Rouvrez l'app et reconnectez-vous
4. Le patient doit toujours être présent
```

### Test du mode démo expiré
```bash
1. Connectez-vous en mode démo
2. Attendez 30 minutes (ou modifiez DEMO_SESSION_DURATION dans le code)
3. L'app doit vous déconnecter automatiquement
4. Les données démo doivent être effacées
```

---

## 🐛 6. PROBLÈMES CONNUS

### Si vous ne pouvez pas vous connecter
```bash
# Vérifiez que Supabase est démarré
supabase status

# Si non démarré
supabase start

# Vérifiez les variables d'environnement
cat .env
# Doit contenir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

### Si le mode démo ne fonctionne pas
```bash
# Vérifiez la console DevTools pour les erreurs
# Le compte demo@osteopraxis.com doit exister dans Supabase Auth

# Pour le créer manuellement via SQL:
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'demo@osteopraxis.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  '{"is_demo": true}'::jsonb
);
```

### Si les données ne persistent pas
```bash
# Vérifiez que le navigateur supporte OPFS
# Chrome 102+, Edge 102+, Firefox 111+

# Testez IndexedDB fallback dans la console:
indexedDB.databases()
```

---

## 📊 7. RÉSUMÉ DES PARCOURS

| Parcours | Email | Password | Durée | Données | Stockage |
|----------|-------|----------|-------|---------|----------|
| **Démo** | demo@osteopraxis.com | demo123456 | 30 min | Fictives | Temporaire |
| **User** | À créer | À définir | ∞ | Réelles | Chiffré local |
| **Admin** | afdevflo@gmail.com | Personnel | ∞ | Réelles | Chiffré local |

---

## 🚀 8. COMMANDES UTILES

```bash
# Démarrer l'app en dev
npm run dev

# Démarrer Supabase local
supabase start

# Réinitialiser la base de données
supabase db reset

# Appliquer les migrations
supabase db push

# Voir les logs Supabase
supabase logs

# Build production
npm run build

# Tests E2E
npm run test:e2e
```

---

## 📝 NOTES IMPORTANTES

1. **Mode démo vs Compte réel**:
   - Le mode démo est parfait pour explorer l'interface
   - Pour tester la persistance et le chiffrement, utilisez un compte réel

2. **Compte admin**:
   - Votre email (afdevflo@gmail.com) est configuré comme premier admin
   - Si vous voulez tester avec un autre compte admin, modifiez la migration `20250724120000_admin_bootstrap.sql`

3. **Données de santé**:
   - Toutes les données patients sont stockées **localement** (jamais sur Supabase)
   - Seules les infos non-sensibles (profil ostéo, cabinets) sont sur le cloud

4. **Sécurité**:
   - Le mot de passe de chiffrement n'est **jamais** stocké (uniquement en RAM)
   - Les exports .phds sont chiffrés avec votre mot de passe

---

**Bon test ! 🎉**

Si vous avez des questions, consultez le README.md principal ou les commentaires dans le code.
