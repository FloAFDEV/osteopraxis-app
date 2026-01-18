# 🔐 PHASE 1 - VALIDATION & SÉCURITÉ

**Date démarrage** : 17 Janvier 2026
**Durée estimée** : 1.5 jours (11h)
**Statut** : 🟡 EN COURS

---

## 📋 PLAN D'EXÉCUTION

### ✅ ÉTAPE 1 - Tests de validation (2h)

**Objectif** : Valider que l'architecture hybride fonctionne 100% comme prévu

#### Test 1.1 - Création patient offline ⏳
**Procédure** :
1. Ouvrir l'app en mode authentifié
2. Déconnecter Internet (mode avion)
3. Aller sur "Nouveau patient"
4. Remplir formulaire complet
5. Sauvegarder
6. Ouvrir DevTools > Application > OPFS
7. Vérifier fichier `{id}_patients.hds` existe
8. Ouvrir DevTools > Network
9. Vérifier 0 requête réseau (sauf si déjà en cache)

**Résultat attendu** :
- ✅ Patient créé sans erreur
- ✅ Fichier OPFS chiffré créé
- ✅ Aucune requête Supabase (ou erreur 0 byte si cache)

**Résultat réel** : ⏳ À TESTER

**Si échec** :
- Identifier le composant qui tente d'appeler Supabase
- Forcer utilisation `hds-secure-patient-service.ts`
- Vérifier `StorageRouter` route bien vers `local`

---

#### Test 1.2 - Création RDV offline ⏳
**Procédure** :
1. Mode avion activé
2. Aller sur "Nouveau rendez-vous"
3. Sélectionner patient (existant local)
4. Remplir formulaire
5. Sauvegarder
6. Vérifier OPFS `{id}_appointments.hds`
7. Vérifier DevTools Network

**Résultat attendu** :
- ✅ RDV créé sans erreur
- ✅ Fichier OPFS chiffré
- ✅ 0 requête réseau

**Résultat réel** : ⏳ À TESTER

---

#### Test 1.3 - Audit réseau complet (online) ⏳
**Procédure** :
1. Reconnecter Internet
2. Ouvrir DevTools > Network
3. Filtrer requêtes Supabase
4. Effacer historique Network
5. Créer patient complet
6. Créer RDV
7. Créer facture
8. Observer toutes les requêtes

**Résultat attendu** :
- ✅ Requêtes auth.supabase.co (OK - auth cloud)
- ✅ Requêtes pour cabinets/osteopaths (OK - non-HDS)
- ❌ ZÉRO requête pour patients/appointments/invoices

**Résultat réel** : ⏳ À TESTER

**Si échec** :
- Noter URL exacte de la requête fautive
- Identifier le fichier source (DevTools > Initiator)
- Corriger le composant pour utiliser service local

---

#### Test 1.4 - Vérification tables Supabase ⏳
**Procédure** :
1. Connexion Supabase Dashboard
2. Table Editor > Voir toutes les tables
3. Vérifier présence/absence tables HDS

**Résultat attendu** :
- ❌ Table `Patient` n'existe pas OU vide
- ❌ Table `Appointment` n'existe pas OU vide
- ❌ Table `Consultation` n'existe pas OU vide
- ❌ Table `MedicalDocument` n'existe pas OU vide
- ❌ Table `TreatmentHistory` n'existe pas OU vide
- ✅ Tables `Cabinet`, `Osteopath`, `User` existent (OK)

**Résultat réel** : ⏳ À VÉRIFIER

**Si tables existent avec données** :
- Créer migration SQL pour DROP tables
- Exécuter migration
- Vérifier suppression

---

#### Test 1.5 - Mode démo isolation ⏳
**Procédure** :
1. Ouvrir `/demo` ou activer mode démo
2. Créer patient/RDV fictifs
3. Ouvrir DevTools > Application > sessionStorage
4. Vérifier données dans sessionStorage uniquement
5. Ouvrir DevTools > Network
6. Vérifier 0 requête Supabase

**Résultat attendu** :
- ✅ Données dans sessionStorage
- ✅ Aucune donnée dans OPFS/IndexedDB
- ✅ 0 interaction Supabase

**Résultat réel** : ⏳ À TESTER

---

### ✅ ÉTAPE 2 - Anonymisation audit_logs (2h)

**Objectif** : Éviter corrélation indirecte via IDs patients/ostéopathes dans les logs

#### Action 2.1 - Analyser audit_logs actuel ⏳
**Fichier** : Supabase Dashboard > Table Editor > `audit_logs`

**Colonnes à vérifier** :
- `record_id` - Contient ID patient/appointment/etc ?
- `old_values` - Contient données complètes ?
- `new_values` - Contient données complètes ?
- `user_id` - Contient auth user ID (OK si juste auth)

**Problème identifié** :
- Si `record_id` = patient ID → Corrélation possible
- Si `old_values`/`new_values` = JSON patient → Fuite directe

**Solution** :
1. Hash `record_id` avant logging
2. Ne jamais logger `old_values`/`new_values` pour tables HDS
3. Ou supprimer audit_logs pour tables HDS (patients, appointments)

---

#### Action 2.2 - Modifier triggers audit Supabase ⏳

**Fichier** : Migration Supabase SQL

**Option A - Hash IDs (recommandée)** :
```sql
-- Modifier trigger audit pour hasher les IDs
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Hash record_id pour éviter corrélation
  INSERT INTO audit_logs (
    action,
    table_name,
    record_id_hash, -- Nouveau champ hasher
    user_id,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    encode(digest(NEW.id::text, 'sha256'), 'hex'), -- Hash SHA-256
    auth.uid(),
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent',
    NOW()
  );
  -- Ne JAMAIS logger old_values/new_values pour tables HDS
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Option B - Désactiver audit pour tables HDS** :
```sql
-- Supprimer triggers audit pour tables HDS
DROP TRIGGER IF EXISTS audit_patient_changes ON "Patient";
DROP TRIGGER IF EXISTS audit_appointment_changes ON "Appointment";
DROP TRIGGER IF EXISTS audit_invoice_changes ON "Invoice";
```

**Recommandation** : **Option B** (plus sûr)
- Logs d'audit pour cabinets/osteopaths OK
- Mais AUCUN log pour données HDS

---

#### Action 2.3 - Tester anonymisation ⏳
1. Créer patient
2. Modifier patient
3. Vérifier `audit_logs` :
   - ✅ Aucune entrée pour patient (si Option B)
   - ✅ Entrée avec hash uniquement (si Option A)

---

### ✅ ÉTAPE 3 - Décision Google Calendar Sync (4h)

**Objectif** : Décider du sort de la fonctionnalité et implémenter la solution

#### Action 3.1 - Analyser le besoin utilisateur ⏳

**Questions à se poser** :
1. Les ostéopathes veulent-ils vraiment sync Google Calendar ?
2. Est-ce un must-have ou nice-to-have ?
3. Acceptent-ils que les événements soient anonymisés ?

**Décision recommandée** : **Option A - Anonymiser**

**Pourquoi** :
- Garde la fonctionnalité (valeur utilisateur)
- Conforme HDS (aucune donnée patient vers Google)
- Simple à implémenter

---

#### Action 3.2 - Implémenter anonymisation (si Option A) ⏳

**Fichier** : `supabase/functions/google-calendar-sync/index.ts`

**Actuellement** : Désactivé (retourne 503)

**Nouvelle implémentation** :
```typescript
// Créer événement Google Calendar ANONYMISÉ
const event = {
  summary: 'Rendez-vous', // JAMAIS le nom du patient
  description: '', // VIDE - pas de motif consultation
  location: cabinetAddress, // Adresse cabinet uniquement
  start: {
    dateTime: appointmentDate,
    timeZone: 'Europe/Paris'
  },
  end: {
    dateTime: appointmentEndDate,
    timeZone: 'Europe/Paris'
  },
  // Couleur spéciale pour distinguer visuellement
  colorId: '9' // Bleu Google Calendar
};

// Créer événement Google
const response = await fetch(
  'https://www.googleapis.com/calendar/v3/calendars/primary/events',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  }
);
```

**Résultat** :
- ✅ Événement créé dans Google Calendar
- ✅ Titre générique "Rendez-vous"
- ✅ Aucune donnée patient
- ✅ Seule info : date/heure + adresse cabinet

---

#### Action 3.3 - Ou Option B - Chiffrer E2E ⏳

**Si vraiment besoin d'avoir infos patient dans calendrier** :

```typescript
// Chiffrer le nom patient avant envoi
import { encryptJSON } from '@/utils/crypto';

const encryptedPatientName = await encryptJSON(
  { name: patientFullName },
  userPassword // Password utilisateur local
);

const event = {
  summary: encryptedPatientName, // Chiffré
  description: '', // Vide
  location: cabinetAddress
};
```

**Problème** :
- Google Calendar affichera du charabia
- Nécessite déchiffrement côté client pour visualisation
- Complexe à implémenter

**Recommandation** : **Éviter, privilégier Option A**

---

#### Action 3.4 - Ou Option C - Supprimer définitivement ⏳

**Si fonctionnalité peu utilisée** :

```bash
# Supprimer complètement la fonction
rm -rf supabase/functions/google-calendar-sync

# Supprimer références dans le code
grep -r "google-calendar-sync" src/
# Supprimer tous les imports/appels
```

**Avantage** :
- Zéro risque de fuite
- Simplification codebase

**Inconvénient** :
- Perte fonctionnalité

---

### ✅ ÉTAPE 4 - Vérification finale (1h)

**Objectif** : S'assurer que le modèle hybride est 100% respecté

#### Checklist finale ⏳

- [ ] Tests validation tous passés (patient/RDV offline)
- [ ] Audit réseau : 0 requête HDS vers Supabase
- [ ] Tables Supabase : aucune table HDS
- [ ] Audit_logs : anonymisé ou désactivé pour HDS
- [ ] Google Calendar : anonymisé, chiffré ou supprimé
- [ ] localStorage : aucune donnée sensible persistée
- [ ] passwordMemory : RAM uniquement
- [ ] Mode démo : isolation totale (sessionStorage)

**Si tous ✅** : Phase 1 COMPLÉTÉE → Passer à Phase 2

**Si échecs** : Corriger et re-tester

---

## 📊 SUIVI PROGRESSION

### Tests (2h)
- [ ] Test 1.1 - Patient offline
- [ ] Test 1.2 - RDV offline
- [ ] Test 1.3 - Audit réseau
- [ ] Test 1.4 - Tables Supabase
- [ ] Test 1.5 - Mode démo

### Sécurité (6h)
- [ ] Analyser audit_logs
- [ ] Modifier triggers (ou désactiver)
- [ ] Tester anonymisation
- [ ] Analyser besoin Google Calendar
- [ ] Implémenter solution choisie
- [ ] Tester Google Calendar

### Validation finale (1h)
- [ ] Checklist complète
- [ ] Documentation résultats
- [ ] Commit + Push

---

## 🚨 RISQUES PHASE 1

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Tests échouent (patient offline) | MOYENNE | HAUTE | Corriger service utilisé |
| Tables HDS existent encore dans Supabase | HAUTE | CRITIQUE | Migration DROP immédiate |
| Audit_logs contient données sensibles | HAUTE | HAUTE | Désactiver triggers HDS |
| Google Calendar impossible à anonymiser | FAIBLE | MOYENNE | Option C (supprimer) |

---

## 📝 NOTES

**Décisions prises** :
- ✅ Phase 1 choisie (validation + sécurité)
- ✅ Priorité : Tests → Audit_logs → Google Calendar

**Prochaines étapes** :
1. Exécuter tests validation
2. Documenter résultats
3. Corriger si échecs
4. Passer aux corrections sécurité

**Après Phase 1** :
- Phase 2 : Développement CR + Fichiers
- Phase 3 : UX + Stabilité
- Phase 4 : Go-to-Market

---

**Dernière mise à jour** : 17 Janvier 2026
**Statut** : 🟡 EN COURS - Tests à lancer
