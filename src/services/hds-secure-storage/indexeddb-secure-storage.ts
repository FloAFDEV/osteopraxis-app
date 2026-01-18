/**
 * 🔐 IndexedDB Secure Storage - Fallback pour Safari/Firefox
 * 
 * Stockage HDS sécurisé dans IndexedDB avec chiffrement AES-256-GCM
 * Utilise la même crypto que FSA pour compatibilité
 */

import { SecureStorageBackend, StorageInfo, SecureStorageConfig } from './interfaces';
import { encryptJSON, decryptJSON, generateSHA256 } from '@/utils/crypto';

export class IndexedDBSecureStorage implements SecureStorageBackend {
  private dbName = 'OstéoPraxis-HDS-Secure';
  private dbVersion = 1;
  private password: string = '';
  private entities: string[] = [];
  private db: IDBDatabase | null = null;

  async configure(config: SecureStorageConfig): Promise<void> {
    console.log('🔐 Configuration IndexedDB Secure Storage...');
    
    this.password = config.password;
    this.entities = config.entities;
    
    await this.initializeDB();
    console.log('✅ IndexedDB Secure Storage configuré');
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Erreur ouverture IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Créer les stores pour chaque entité
        for (const entity of this.entities) {
          if (!db.objectStoreNames.contains(entity)) {
            const store = db.createObjectStore(entity, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt');
            store.createIndex('updatedAt', 'updatedAt');
          }
        }
      };
    });
  }

  async save<T extends { id: string | number }>(storeName: string, record: T): Promise<T> {
    if (!this.db) throw new Error('IndexedDB non initialisé');
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Ajouter timestamps
    const recordWithTimestamps = {
      ...record,
      updatedAt: new Date().toISOString(),
      createdAt: (record as any).createdAt || new Date().toISOString()
    };

    // Chiffrer le record
    const encrypted = await encryptJSON(recordWithTimestamps, this.password);
    const encryptedRecord = {
      id: record.id,
      encrypted: true,
      data: encrypted
    };

    return new Promise((resolve, reject) => {
      const request = store.put(encryptedRecord);
      
      request.onsuccess = () => {
        console.log(`✅ Record ${record.id} sauvegardé (chiffré) dans ${storeName}`);
        resolve(recordWithTimestamps as T);
      };
      
      request.onerror = () => {
        reject(new Error(`Erreur sauvegarde ${storeName}:${record.id}`));
      };
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('IndexedDB non initialisé');
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = async () => {
        try {
          const encryptedRecords = request.result;
          const decryptedRecords: T[] = [];
          
          for (const encRecord of encryptedRecords) {
            if (encRecord.encrypted && encRecord.data) {
              const decrypted = await decryptJSON(encRecord.data, this.password);
              decryptedRecords.push(decrypted);
            }
          }
          
          console.log(`📖 ${decryptedRecords.length} records déchiffrés depuis ${storeName}`);
          resolve(decryptedRecords);
        } catch (error) {
          reject(new Error(`Erreur déchiffrement ${storeName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Erreur lecture ${storeName}`));
      };
    });
  }

  async getById<T>(storeName: string, id: string | number): Promise<T | null> {
    if (!this.db) throw new Error('IndexedDB non initialisé');
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = async () => {
        try {
          const encRecord = request.result;
          
          if (!encRecord || !encRecord.encrypted || !encRecord.data) {
            resolve(null);
            return;
          }
          
          const decrypted = await decryptJSON(encRecord.data, this.password);
          resolve(decrypted);
        } catch (error) {
          reject(new Error(`Erreur déchiffrement ${storeName}:${id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Erreur lecture ${storeName}:${id}`));
      };
    });
  }

  async delete(storeName: string, id: string | number): Promise<void> {
    if (!this.db) throw new Error('IndexedDB non initialisé');
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log(`🗑️ Record ${id} supprimé de ${storeName}`);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Erreur suppression ${storeName}:${id}`));
      };
    });
  }

  async exportBackup(): Promise<Blob> {
    console.log('📦 Export backup IndexedDB...');
    
    const allData: Record<string, any[]> = {};
    
    // Récupérer toutes les données de toutes les entités
    for (const entity of this.entities) {
      try {
        allData[entity] = await this.getAll(entity);
      } catch (error) {
        console.warn(`⚠️ Erreur export ${entity}:`, error);
        allData[entity] = [];
      }
    }
    
    // Créer le payload de backup
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      type: 'IndexedDB' as const,
      entities: this.entities,
      data: allData
    };
    
    // Chiffrer le backup
    const encrypted = await encryptJSON(backupData, this.password);
    
    const blob = new Blob([JSON.stringify(encrypted)], { 
      type: 'application/json' 
    });
    
    console.log('✅ Backup IndexedDB créé');
    return blob;
  }

  async importBackup(file: File, password: string): Promise<void> {
    console.log('📥 Import backup IndexedDB...');
    
    const text = await file.text();
    const encrypted = JSON.parse(text);
    
    // Déchiffrer le backup
    const backupData = await decryptJSON(encrypted, password);
    
    if (backupData.version !== 1) {
      throw new Error('Version de backup non supportée');
    }
    
    // Restaurer les données
    for (const [entity, records] of Object.entries(backupData.data)) {
      if (Array.isArray(records)) {
        for (const record of records) {
          await this.save(entity, record);
        }
      }
    }
    
    console.log('✅ Backup IndexedDB restauré');
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test d'ouverture simple
      const request = indexedDB.open('test-availability', 1);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          request.result.close();
          resolve(true);
        };
        
        request.onerror = () => {
          resolve(false);
        };
        
        // Timeout de 2 secondes
        setTimeout(() => resolve(false), 2000);
      });
    } catch {
      return false;
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    const entitiesCount: Record<string, number> = {};
    let totalSize = 0;
    
    for (const entity of this.entities) {
      try {
        const records = await this.getAll(entity);
        entitiesCount[entity] = records.length;
        
        // Estimation de la taille (approximative)
        const entitySize = JSON.stringify(records).length;
        totalSize += entitySize;
      } catch {
        entitiesCount[entity] = 0;
      }
    }
    
    return {
      type: 'IndexedDB',
      available: await this.isAvailable(),
      configured: this.db !== null,
      unlocked: this.password !== '',
      entitiesCount,
      totalSize
    };
  }

  async lock(): Promise<void> {
    this.password = '';
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    console.log('🔒 IndexedDB Secure Storage verrouillé');
  }

  async unlock(password: string): Promise<boolean> {
    try {
      this.password = password;
      await this.initializeDB();
      
      // Test de lecture pour valider le mot de passe
      for (const entity of this.entities) {
        await this.getAll(entity);
      }
      
      console.log('✅ IndexedDB Secure Storage déverrouillé');
      return true;
    } catch (error) {
      console.error('❌ Erreur déverrouillage IndexedDB:', error);
      this.password = '';
      return false;
    }
  }
}