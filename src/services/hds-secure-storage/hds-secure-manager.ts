/**
 * 🔐 Gestionnaire de stockage HDS sécurisé - VERSION 2.0
 * 
 * REMPLACE complètement l'ancien système IndexedDB
 * Utilise des fichiers physiques chiffrés AES-256-GCM + HMAC
 * 
 * EXCLUSIVEMENT pour le mode connecté - JAMAIS de Supabase pour HDS
 */

import { SecureFileStorage } from '../security/secure-file-storage';
import { checkNativeStorageSupport, requestStorageDirectory } from '../native-file-storage/native-file-adapter';

export interface HDSSecureConfig {
  directoryHandle?: FileSystemDirectoryHandle;
  password: string;
  entities: string[];
}

export interface HDSSecureStatus {
  isConfigured: boolean;
  isUnlocked: boolean;
  physicalStorageAvailable: boolean;
  entitiesCount: Record<string, number>;
  totalSize: number;
  integrityStatus: Record<string, boolean>;
  lastBackup?: string;
}

export class HDSSecureManager {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private password: string | null = null;
  private storages: Map<string, SecureFileStorage> = new Map();
  private configured = false;
  private unlocked = false;

  /**
   * Vérifier le support du stockage sécurisé
   */
  checkSupport() {
    return checkNativeStorageSupport();
  }

  /**
   * Configurer le stockage HDS sécurisé
   */
  async configure(config: HDSSecureConfig): Promise<void> {
    try {
      console.log('🔐 Configuration du stockage HDS sécurisé...');
      
      // Vérifier le support
      const support = this.checkSupport();
      if (!support.supported) {
        throw new Error(`Stockage sécurisé non supporté: ${support.details.join(', ')}`);
      }

      // Obtenir l'accès au dossier
      if (!config.directoryHandle) {
        this.directoryHandle = await requestStorageDirectory();
      } else {
        this.directoryHandle = config.directoryHandle;
      }

      this.password = config.password;

      // Créer les adaptateurs sécurisés pour chaque entité HDS
      const entities = config.entities || ['patients', 'appointments', 'invoices'];
      
      for (const entity of entities) {
        const storage = new SecureFileStorage(entity);
        await storage.initialize(this.directoryHandle, this.password);
        this.storages.set(entity, storage);
      }

      this.configured = true;
      this.unlocked = true;

      console.log('✅ Stockage HDS sécurisé configuré avec succès');
      
      // Sauvegarder la configuration (sans le mot de passe ni le handle)
      localStorage.setItem('hds-secure-config', JSON.stringify({
        configured: true,
        entities,
        configuredAt: new Date().toISOString()
      }));

    } catch (error) {
      console.error('❌ Erreur configuration stockage HDS sécurisé:', error);
      this.configured = false;
      this.unlocked = false;
      throw error;
    }
  }

  /**
   * Obtenir le statut du stockage sécurisé
   */
  async getStatus(): Promise<HDSSecureStatus> {
    if (!this.configured) {
      return {
        isConfigured: false,
        isUnlocked: false,
        physicalStorageAvailable: false,
        entitiesCount: {},
        totalSize: 0,
        integrityStatus: {}
      };
    }

    const entitiesCount: Record<string, number> = {};
    const integrityStatus: Record<string, boolean> = {};
    let totalSize = 0;

    for (const [entityName, storage] of this.storages) {
      try {
        const stats = await storage.getStats();
        entitiesCount[entityName] = stats.count;
        totalSize += stats.size;
        integrityStatus[entityName] = stats.integrity;
      } catch (error) {
        console.warn(`⚠️ Erreur stats ${entityName}:`, error);
        entitiesCount[entityName] = 0;
        integrityStatus[entityName] = false;
      }
    }

    return {
      isConfigured: this.configured,
      isUnlocked: this.unlocked,
      physicalStorageAvailable: this.configured && this.unlocked,
      entitiesCount,
      totalSize,
      integrityStatus
    };
  }

  /**
   * Obtenir un adaptateur de stockage sécurisé pour une entité
   */
  getSecureStorage(entityName: string): SecureFileStorage | null {
    return this.storages.get(entityName) || null;
  }

  /**
   * Verrouiller le stockage sécurisé
   */
  lock(): void {
    this.unlocked = false;
    this.password = null;
    console.log('🔒 Stockage HDS sécurisé verrouillé');
  }

  /**
   * Déverrouiller le stockage sécurisé
   */
  async unlock(password: string): Promise<boolean> {
    if (!this.configured) {
      console.warn('⚠️ Stockage HDS sécurisé non configuré');
      return false;
    }

    try {
      this.password = password;
      
      // Tester le déverrouillage en tentant de charger une entité
      const testEntity = this.storages.keys().next().value;
      if (testEntity) {
        const storage = this.storages.get(testEntity);
        if (storage) {
          // Réinitialiser avec le nouveau mot de passe
          await storage.initialize(this.directoryHandle!, password);
          // Tenter de charger les données pour valider le mot de passe
          await storage.loadRecords();
        }
      }

      this.unlocked = true;
      console.log('🔓 Stockage HDS sécurisé déverrouillé');
      return true;
    } catch (error) {
      console.error('❌ Erreur déverrouillage:', error);
      this.password = null;
      this.unlocked = false;
      return false;
    }
  }

  /**
   * Vérifier l'intégrité de tous les fichiers HDS
   */
  async verifyAllIntegrity(): Promise<{
    overallValid: boolean;
    results: Record<string, any>;
  }> {
    const results: Record<string, any> = {};
    let overallValid = true;

    console.log('🔍 Vérification d\'intégrité de tous les fichiers HDS...');

    for (const [entityName, storage] of this.storages) {
      try {
        const integrityResult = await storage.verifyIntegrity();
        results[entityName] = integrityResult;
        
        if (!integrityResult.valid) {
          overallValid = false;
          console.error(`❌ Intégrité compromise pour ${entityName}:`, integrityResult.errors);
        } else {
          console.log(`✅ Intégrité valide pour ${entityName}`);
        }
      } catch (error) {
        results[entityName] = {
          valid: false,
          errors: [`Erreur vérification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
          warnings: [],
          metadata: null
        };
        overallValid = false;
      }
    }

    return { overallValid, results };
  }

  /**
   * Exporter toutes les données HDS de façon sécurisée
   */
  async exportAllSecure(): Promise<void> {
    if (!this.unlocked) {
      throw new Error('Stockage HDS verrouillé');
    }

    console.log('📦 Export sécurisé de toutes les données HDS...');
    
    for (const [entityName, storage] of this.storages) {
      try {
        await storage.exportSecure();
        console.log(`✅ Export sécurisé ${entityName} réussi`);
      } catch (error) {
        console.error(`❌ Erreur export sécurisé ${entityName}:`, error);
      }
    }
  }

  /**
   * Migration depuis l'ancien système IndexedDB
   */
  async migrateFromIndexedDB(userId: string): Promise<{
    migrated: Record<string, number>;
    errors: string[];
  }> {
    const result = {
      migrated: {} as Record<string, number>,
      errors: [] as string[]
    };

    if (!this.configured || !this.unlocked) {
      throw new Error('Stockage HDS sécurisé non configuré ou verrouillé');
    }

    console.log('🔄 Migration depuis IndexedDB vers stockage HDS sécurisé...');

    try {
      // Importer l'ancien gestionnaire IndexedDB
      const { hdsLocalStorage } = await import('../hds-local-storage/hds-storage-manager');
      await hdsLocalStorage.initialize(userId, 1);

      // Migrer chaque type d'entité
      const migrations = [
        { entity: 'patients', method: () => hdsLocalStorage.getPatients() },
        { entity: 'appointments', method: () => hdsLocalStorage.getAppointments() },
        { entity: 'invoices', method: () => hdsLocalStorage.getInvoices() }
      ];

      for (const migration of migrations) {
        try {
          const oldData = await migration.method();
          
          if (oldData.length > 0) {
            const secureStorage = this.getSecureStorage(migration.entity);
            if (secureStorage) {
              await secureStorage.saveRecords(oldData);
              result.migrated[migration.entity] = oldData.length;
              console.log(`✅ ${oldData.length} enregistrements ${migration.entity} migrés`);
            }
          }
        } catch (error) {
          const errorMsg = `Erreur migration ${migration.entity}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Nettoyer l'ancien stockage après migration réussie
      if (result.errors.length === 0) {
        try {
          await hdsLocalStorage.clearAllData();
          console.log('🧹 Ancien stockage IndexedDB nettoyé');
        } catch (error) {
          result.errors.push('Erreur nettoyage ancien stockage');
        }
      }

    } catch (error) {
      result.errors.push(`Erreur accès ancien stockage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  }

  /**
   * Réinitialiser complètement le stockage sécurisé
   */
  async reset(): Promise<void> {
    console.log('🗑️ Réinitialisation du stockage HDS sécurisé...');
    
    this.storages.clear();
    this.directoryHandle = null;
    this.password = null;
    this.configured = false;
    this.unlocked = false;
    
    localStorage.removeItem('hds-secure-config');
    
    console.log('✅ Stockage HDS sécurisé réinitialisé');
  }

  /**
   * Vérifier si le stockage est configuré (depuis localStorage)
   */
  isConfiguredFromStorage(): boolean {
    const config = localStorage.getItem('hds-secure-config');
    if (!config) return false;
    
    try {
      const parsed = JSON.parse(config);
      return parsed.configured === true;
    } catch {
      return false;
    }
  }
}

// Instance singleton
export const hdsSecureManager = new HDSSecureManager();