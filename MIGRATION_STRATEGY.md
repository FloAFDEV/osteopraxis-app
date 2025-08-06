# 🏗️ STRATÉGIE DE SYNCHRONISATION HYBRIDE

## 📋 **OVERVIEW**

Architecture permettant le partage sécurisé de données patients entre praticiens d'un même cabinet, tout en conservant le stockage local chiffré.

## 🔄 **MÉCANISME DE SYNCHRONISATION**

### **1. Cabinet Sync Metadata (Supabase)**
```sql
-- Table pour les métadonnées de synchronisation (NON-sensibles)
CREATE TABLE cabinet_patient_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id INTEGER REFERENCES "Cabinet"(id),
  patient_local_id TEXT NOT NULL, -- ID local du patient (hasher)
  owner_osteopath_id INTEGER REFERENCES "Osteopath"(id),
  shared_with_osteopath_id INTEGER REFERENCES "Osteopath"(id),
  sync_permission TEXT NOT NULL CHECK (sync_permission IN ('read', 'write', 'full')),
  patient_hash TEXT NOT NULL, -- Hash pour identifier le patient sans exposer l'ID
  last_sync_timestamp TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Encrypted Data Exchange Hub (Supabase Storage)**
```sql
-- Bucket pour les échanges temporaires chiffrés
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cabinet-sync', 'cabinet-sync', false);

-- Policies pour l'accès aux données de sync
CREATE POLICY "Cabinet members can upload sync data"
ON storage.objects FOR INSERT 
USING (
  bucket_id = 'cabinet-sync' 
  AND auth.uid() IN (
    SELECT o."authId" FROM "Osteopath" o
    JOIN osteopath_cabinet oc ON o.id = oc.osteopath_id
    WHERE oc.cabinet_id::text = (storage.foldername(name))[1]
  )
);
```

### **3. Flux de synchronisation**

#### **A. Partage initial d'un patient**
1. **Praticien A** : "Je veux partager ce patient avec Praticien B"
2. **Système** : 
   - Chiffre les données patient avec une clé temporaire
   - Upload le fichier chiffré dans Storage (expiration 24h)
   - Crée l'entrée metadata dans `cabinet_patient_sync`
   - Notifie Praticien B via notification Supabase

#### **B. Récupération par le destinataire**
1. **Praticien B** reçoit notification
2. **Système** :
   - Vérifie les permissions cabinet
   - Télécharge le fichier chiffré
   - Déchiffre avec la clé partagée
   - Importe dans SQLite local
   - Supprime le fichier temporaire

#### **C. Synchronisation continue**
1. **Système de delta** : Seules les modifications sont échangées
2. **Merge automatique** avec résolution de conflits
3. **Audit trail** local pour traçabilité

## 🔐 **SÉCURITÉ**

### **Chiffrement multi-couches**
```typescript
interface SyncSecurity {
  // Clé de cabinet (partagée entre praticiens du même cabinet)
  cabinetKey: string; // Dérivée de cabinet_id + salt
  
  // Clé de session (temporaire pour chaque sync)
  sessionKey: string; // Générée aléatoirement
  
  // Clé patient (spécifique à chaque patient)
  patientKey: string; // Dérivée de patient_id + cabinet_key
}
```

### **Workflow de sécurité**
1. **Double chiffrement** : Cabinet Key + Session Key
2. **Expiration automatique** des fichiers (24h)
3. **Logs d'audit** pour chaque action
4. **Révocation** possible des accès

## 🚀 **IMPLÉMENTATION PROGRESSIVE**

### **Phase 1 : Infrastructure**
- [ ] Tables metadata synchronisation
- [ ] Storage bucket cabinet-sync
- [ ] Service de chiffrement/déchiffrement
- [ ] Interface d'autorisation de partage

### **Phase 2 : Sync de base**
- [ ] Partage manuel patient par patient
- [ ] Import/export sécurisé
- [ ] Notifications en temps réel

### **Phase 3 : Sync avancée**
- [ ] Synchronisation automatique
- [ ] Résolution de conflits
- [ ] Audit et traçabilité

## 📊 **AVANTAGES**

✅ **Conformité HDS** : Données sensibles jamais en cloud
✅ **Collaboration** : Partage sécurisé entre praticiens
✅ **Performance** : Données locales = rapidité
✅ **Contrôle** : Chaque praticien maîtrise ses données
✅ **Traçabilité** : Audit complet des accès
✅ **Scalabilité** : Pas de limite de stockage cloud

## 🔧 **ALTERNATIVES CONSIDÉRÉES**

### **Option A : QR Code + Export**
- ✅ Simple à implémenter
- ❌ Peu pratique pour usage quotidien
- ❌ Pas de sync automatique

### **Option B : WebRTC P2P**
- ✅ Pas de transit par serveur
- ❌ Complexité technique élevée
- ❌ Praticiens doivent être connectés simultanément

### **Option C : Email chiffré**
- ✅ Familier pour les utilisateurs
- ❌ Gestion manuelle fastidieuse
- ❌ Risques de fuite par email

## 🎯 **PROCHAINES ÉTAPES**

1. **Valider cette approche** avec vos contraintes métier
2. **Implémenter l'infrastructure** (tables + storage)
3. **Créer le service de sync** (chiffrement + API)
4. **Interface utilisateur** pour gérer les partages
5. **Tests de sécurité** et validation HDS

---

**Question ouverte** : Préférez-vous commencer par une approche manuelle simple (partage patient par patient) ou directement une sync plus automatisée ?