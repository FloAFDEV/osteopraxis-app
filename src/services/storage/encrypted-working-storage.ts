/**
 * 🔐 Stockage chiffré temporaire avec code PIN 6 chiffres
 * 
 * Extension de IndexedDBSecureStorage avec :
 * - Configuration via code PIN 6 chiffres
 * - Sauvegardes automatiques toutes les 5 minutes
 * - Export/Import de backups chiffrés
 */

import { IndexedDBSecureStorage } from '@/services/hds-secure-storage/indexeddb-secure-storage';

/**
 * 🔐 Sécurité PIN améliorée avec PBKDF2
 * 
 * Remplace le hash SHA-256 simple par PBKDF2 + salt pour résister aux attaques rainbow table
 */
async function hashPinSecure(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000; // Recommandation OWASP 2024
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Format: salt:hash (hex)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${hashHex}`;
}

/**
 * Vérifie un PIN contre un hash PBKDF2
 */
async function verifyPinSecure(pin: string, storedHash: string): Promise<boolean> {
  const [saltHex, expectedHashHex] = storedHash.split(':');
  
  if (!saltHex || !expectedHashHex) {
    return false;
  }
  
  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const iterations = 100000;
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const actualHashHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return actualHashHex === expectedHashHex;
}

export class EncryptedWorkingStorage extends IndexedDBSecureStorage {
  private autoBackupInterval: number | null = null;
  private lastBackupTime: Date | null = null;
  
  /**
   * 🔐 Configuration avec le mot de passe Supabase
   * 
   * Utilise directement le mot de passe de connexion Supabase pour chiffrer
   * les données HDS locales (IndexedDB).
   */
  async configureWithPassword(password: string): Promise<void> {
    // Configurer le stockage avec le password Supabase
    await this.configure({
      password: password,
      entities: ['patients', 'appointments', 'invoices']
    });
    
    console.log('✅ Stockage chiffré configuré avec mot de passe Supabase');
  }

  /**
   * @deprecated Utiliser configureWithPassword à la place
   * Conservé pour rétrocompatibilité pendant la migration
   */
  async configureWithPin(pin: string): Promise<void> {
    // Rediriger vers la nouvelle méthode
    await this.configureWithPassword(pin);
  }

  /**
   * 🔄 Migration depuis l'ancien système PIN
   * 
   * Permet de migrer automatiquement les données chiffrées avec un PIN
   * vers le nouveau système utilisant le password Supabase.
   */
  async migrateFromPin(oldPin: string, newPassword: string): Promise<void> {
    const storedPinHash = localStorage.getItem('temp-storage-pin-hash');
    
    if (!storedPinHash) {
      console.log('ℹ️ Pas de migration nécessaire: pas d\'ancien PIN détecté');
      return;
    }

    console.log('🔄 Migration détectée: ancien système PIN → nouveau système password');

    // 1. Vérifier que l'ancien PIN est correct
    const isValidPin = await verifyPinSecure(oldPin, storedPinHash);
    if (!isValidPin) {
      throw new Error('Code PIN incorrect');
    }

    // 2. Déverrouiller avec l'ancien PIN pour lire les données
    await this.configure({
      password: oldPin,
      entities: ['patients', 'appointments', 'invoices']
    });

    // 3. Exporter toutes les données
    const allData: any = {};
    for (const entityName of ['patients', 'appointments', 'invoices']) {
      try {
        allData[entityName] = await this.getAll(entityName);
        console.log(`📦 ${allData[entityName].length} ${entityName} exportés`);
      } catch (error) {
        console.error(`❌ Erreur export ${entityName}:`, error);
        allData[entityName] = [];
      }
    }

    // 4. Nettoyer l'ancien stockage
    await this.lock();

    // 5. Reconfigurer avec le nouveau password
    await this.configure({
      password: newPassword,
      entities: ['patients', 'appointments', 'invoices']
    });

    // 6. Réimporter toutes les données
    for (const entityName of ['patients', 'appointments', 'invoices']) {
      const records = allData[entityName] || [];
      for (const record of records) {
        await this.save(entityName, record);
      }
      console.log(`✅ ${records.length} ${entityName} importés avec nouveau password`);
    }

    // 7. Supprimer l'ancien hash PIN
    localStorage.removeItem('temp-storage-pin-hash');
    
    console.log('✅ Migration terminée avec succès');
  }
  
  async enableAutoBackup(intervalMinutes = 5): Promise<void> {
    // Désactiver l'ancien intervalle s'il existe
    this.disableAutoBackup();
    
    this.autoBackupInterval = window.setInterval(async () => {
      try {
        console.log('💾 Sauvegarde automatique chiffrée...');
        const backup = await this.exportBackup();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `osteopraxis-backup-${timestamp}.hdsbackup`;
        
        // Télécharger automatiquement
        const url = URL.createObjectURL(backup);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        this.lastBackupTime = new Date();
        console.log('✅ Backup auto créé:', filename);
      } catch (error) {
        console.error('❌ Erreur backup auto:', error);
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`🕐 Sauvegarde automatique activée (toutes les ${intervalMinutes} minutes)`);
  }
  
  disableAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('⏹️ Sauvegarde automatique désactivée');
    }
  }
  
  getBackupStatus() {
    return {
      lastBackup: this.lastBackupTime,
      intervalMinutes: this.autoBackupInterval ? 5 : null,
      isActive: this.autoBackupInterval !== null
    };
  }
}

export const encryptedWorkingStorage = new EncryptedWorkingStorage();
