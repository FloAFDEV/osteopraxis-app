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
  
  async configureWithPin(pin: string): Promise<void> {
    // Vérifier le hash du PIN avec PBKDF2
    const storedHash = localStorage.getItem('temp-storage-pin-hash');
    
    if (storedHash) {
      const isValid = await verifyPinSecure(pin, storedHash);
      if (!isValid) {
        throw new Error('Code PIN incorrect');
      }
    } else {
      // Si c'est la première fois, créer un hash sécurisé PBKDF2
      const secureHash = await hashPinSecure(pin);
      localStorage.setItem('temp-storage-pin-hash', secureHash);
    }
    
    // Configurer le stockage avec le PIN comme mot de passe
    await this.configure({
      password: pin, // Le PIN est utilisé directement par PBKDF2
      entities: ['patients', 'appointments', 'invoices']
    });
    
    console.log('✅ Stockage chiffré temporaire configuré avec PIN PBKDF2 sécurisé');
  }
  
  async enableAutoBackup(intervalMinutes = 5): Promise<void> {
    // Désactiver l'ancien intervalle s'il existe
    this.disableAutoBackup();
    
    this.autoBackupInterval = window.setInterval(async () => {
      try {
        console.log('💾 Sauvegarde automatique chiffrée...');
        const backup = await this.exportBackup();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `patienthub-backup-${timestamp}.hdsbackup`;
        
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
