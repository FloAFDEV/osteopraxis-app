/**
 * 🔐 FSA Secure Storage - Prioritaire pour Chrome/Edge
 * 
 * Adapter l'existant EnhancedSecureFileStorage vers l'interface commune
 */

import { SecureStorageBackend, StorageInfo, SecureStorageConfig } from './interfaces';
import { EnhancedSecureFileStorage } from '../security/enhanced-secure-storage';
import { requestStorageDirectory } from '../native-file-storage/native-file-adapter';
import { persistDirectoryHandle, getPersistedDirectoryHandle } from '../native-file-storage/directory-persistence';
import { encryptJSON, decryptJSON } from '@/utils/crypto';

export class FSASecureStorage implements SecureStorageBackend {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private password: string = '';
  private entities: string[] = [];
  private storages: Map<string, EnhancedSecureFileStorage> = new Map();

  async configure(config: SecureStorageConfig): Promise<void> {
    console.log('🔐 Configuration FSA Secure Storage...');
    
    this.password = config.password;
    this.entities = config.entities;
    
    // Obtenir l'accès au dossier
    if (config.directoryHandle) {
      this.directoryHandle = config.directoryHandle;
    } else {
      this.directoryHandle = await requestStorageDirectory();
    }
    
    // Persister le handle
    await persistDirectoryHandle(this.directoryHandle, 'hds-storage');
    
    // Initialiser les storages pour chaque entité
    for (const entity of this.entities) {
      const storage = new EnhancedSecureFileStorage(entity);
      await storage.initialize(this.directoryHandle, this.password);
      this.storages.set(entity, storage);
    }
    
    console.log('✅ FSA Secure Storage configuré');
  }

  async save<T extends { id: string | number }>(storeName: string, record: T): Promise<T> {
    const storage = this.storages.get(storeName);
    if (!storage) {
      throw new Error(`Storage non configuré pour ${storeName}`);
    }
    
    return await storage.saveRecord(record);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const storage = this.storages.get(storeName);
    if (!storage) {
      throw new Error(`Storage non configuré pour ${storeName}`);
    }
    
    return await storage.loadRecords<T>();
  }

  async getById<T>(storeName: string, id: string | number): Promise<T | null> {
    const storage = this.storages.get(storeName);
    if (!storage) {
      throw new Error(`Storage non configuré pour ${storeName}`);
    }
    
    return await storage.getRecordById<T>(id);
  }

  async delete(storeName: string, id: string | number): Promise<void> {
    const storage = this.storages.get(storeName);
    if (!storage) {
      throw new Error(`Storage non configuré pour ${storeName}`);
    }
    
    const success = await storage.deleteRecord(id);
    if (!success) {
      throw new Error(`Erreur suppression ${storeName}:${id}`);
    }
  }

  async exportBackup(): Promise<Blob> {
    console.log('📦 Export backup FSA...');
    
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
      type: 'FSA' as const,
      entities: this.entities,
      data: allData
    };
    
    // Chiffrer le backup
    const encrypted = await encryptJSON(backupData, this.password);
    
    const blob = new Blob([JSON.stringify(encrypted)], { 
      type: 'application/json' 
    });
    
    console.log('✅ Backup FSA créé');
    return blob;
  }

  async importBackup(file: File, password: string): Promise<void> {
    console.log('📥 Import backup FSA...');
    
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
    
    console.log('✅ Backup FSA restauré');
  }

  async isAvailable(): Promise<boolean> {
    try {
      return 'showDirectoryPicker' in window;
    } catch {
      return false;
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    const entitiesCount: Record<string, number> = {};
    let totalSize = 0;
    
    for (const [entity, storage] of this.storages) {
      try {
        const stats = await storage.getStats();
        entitiesCount[entity] = stats.count;
        totalSize += stats.size;
      } catch {
        entitiesCount[entity] = 0;
      }
    }
    
    return {
      type: 'FSA',
      available: await this.isAvailable(),
      configured: this.directoryHandle !== null,
      unlocked: this.password !== '',
      entitiesCount,
      totalSize
    };
  }

  async lock(): Promise<void> {
    this.password = '';
    this.storages.clear();
    console.log('🔒 FSA Secure Storage verrouillé');
  }

  async unlock(password: string): Promise<boolean> {
    try {
      this.password = password;
      
      // Récupérer le directory handle persisté
      if (!this.directoryHandle) {
        this.directoryHandle = await getPersistedDirectoryHandle('hds-storage');
        
        if (!this.directoryHandle) {
          throw new Error('Directory handle non trouvé');
        }
      }
      
      // Réinitialiser les storages
      this.storages.clear();
      for (const entity of this.entities) {
        const storage = new EnhancedSecureFileStorage(entity);
        await storage.initialize(this.directoryHandle, password);
        
        // Test de lecture pour valider le mot de passe
        await storage.loadRecords();
        
        this.storages.set(entity, storage);
      }
      
      console.log('✅ FSA Secure Storage déverrouillé');
      return true;
    } catch (error) {
      console.error('❌ Erreur déverrouillage FSA:', error);
      this.password = '';
      this.storages.clear();
      return false;
    }
  }
}