/**
 * 🔐 Gestionnaire de stockage HDS sécurisé - VERSION 2.0
 * 
 * REMPLACE complètement l'ancien système IndexedDB
 * Utilise des fichiers physiques chiffrés AES-256-GCM + HMAC
 * 
 * EXCLUSIVEMENT pour le mode connecté - JAMAIS de Supabase pour HDS
 */

import { EnhancedSecureFileStorage } from '../security/enhanced-secure-storage';
import { checkNativeStorageSupport, requestStorageDirectory } from '../native-file-storage/native-file-adapter';
import { persistDirectoryHandle, getPersistedDirectoryHandle, checkPersistenceSupport } from '../native-file-storage/directory-persistence';
import { checkCryptoSupport, testCrypto } from '@/utils/crypto';

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
  private storages: Map<string, EnhancedSecureFileStorage> = new Map();
  private configured = false;
  private unlocked = false;

  constructor() {
    // Restaurer l'état configuré depuis localStorage
    this.restoreConfigurationState();
  }

  /**
   * Vérifier le support du stockage sécurisé
   */
  checkSupport() {
    const nativeSupport = checkNativeStorageSupport();
    const cryptoSupport = checkCryptoSupport();
    const persistenceSupport = checkPersistenceSupport();
    
    const allDetails = [
      ...nativeSupport.details,
      ...cryptoSupport.details,
      ...persistenceSupport.details
    ];
    
    const supported = nativeSupport.supported && cryptoSupport.supported && persistenceSupport.supported;
    
    return { supported, details: allDetails };
  }

  /**
   * Configurer le stockage HDS sécurisé
   */
  async configure(config: HDSSecureConfig): Promise<void> {
    try {
      console.log('🔐 Configuration du stockage HDS sécurisé...');
      
      // Vérifier le support complet
      const support = this.checkSupport();
      if (!support.supported) {
        throw new Error(`Stockage sécurisé non supporté: ${support.details.join(', ')}`);
      }

      // Test crypto initial avec le mot de passe
      console.log('🧪 Test cryptographique initial...');
      const cryptoTest = await testCrypto(config.password);
      if (!cryptoTest) {
        throw new Error('Test cryptographique initial échoué');
      }

      // Utiliser OPFS (Origin Private File System) automatiquement
      if (!config.directoryHandle) {
        console.log('📁 Utilisation de l\'OPFS (Origin Private File System)...');
        this.directoryHandle = await navigator.storage.getDirectory();
      } else {
        this.directoryHandle = config.directoryHandle;
      }

      // Persister le directoryHandle (uniquement si c'est un handle externe)
      if (config.directoryHandle) {
        await persistDirectoryHandle(this.directoryHandle, 'hds-storage');
      }
      
      this.password = config.password;

      // Créer les adaptateurs sécurisés pour chaque entité HDS
      const entities = config.entities || ['patients', 'appointments', 'invoices'];
      
      for (const entity of entities) {
        console.log(`⚙️ Configuration stockage ${entity}...`);
        const storage = new EnhancedSecureFileStorage(entity);
        await storage.initialize(this.directoryHandle, this.password);
        this.storages.set(entity, storage);
      }

      this.configured = true;
      this.unlocked = true;

      console.log('✅ Stockage HDS sécurisé configuré avec succès');
      
      // Sauvegarder la configuration (sans le mot de passe)
      localStorage.setItem('hds-secure-config', JSON.stringify({
        configured: true,
        entities,
        configuredAt: new Date().toISOString(),
        directoryPersisted: true
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
  getSecureStorage(entityName: string): EnhancedSecureFileStorage | null {
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
      console.log('🔓 Tentative de déverrouillage...');
      
      // Vérifier si on a encore le directoryHandle
      if (!this.directoryHandle) {
        console.log('📁 Récupération du directoryHandle persisté...');
        this.directoryHandle = await getPersistedDirectoryHandle('hds-storage');
        
        if (!this.directoryHandle) {
          console.error('❌ DirectoryHandle non trouvé - reconfiguration nécessaire');
          this.configured = false;
          return false;
        }
      }
      
      // Test crypto avec le mot de passe
      const cryptoTest = await testCrypto(password);
      if (!cryptoTest) {
        console.error('❌ Test cryptographique échoué');
        return false;
      }
      
      this.password = password;
      
      // Réinitialiser tous les storages avec le nouveau mot de passe
      const entities = Array.from(this.storages.keys());
      this.storages.clear();
      
      for (const entity of entities) {
        console.log(`🔄 Réinitialisation storage ${entity}...`);
        const storage = new EnhancedSecureFileStorage(entity);
        await storage.initialize(this.directoryHandle, password);
        
        // Test de lecture pour valider le mot de passe
        await storage.loadRecords();
        
        this.storages.set(entity, storage);
      }

      this.unlocked = true;
      console.log('✅ Stockage HDS sécurisé déverrouillé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur déverrouillage:', error);
      
      if (error instanceof Error && error.message.includes('password')) {
        console.error('❌ Mot de passe incorrect');
      }
      
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
      // Note: Migration depuis l'ancien système supprimée (fallbacks HDS supprimés)
      console.warn('⚠️ Migration depuis IndexedDB non disponible - fallbacks HDS supprimés pour sécurité');
      
      return {
        migrated: {},
        errors: ['Migration non disponible - fallbacks HDS supprimés pour sécurité']
      };
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      return {
        migrated: {},
        errors: [`Erreur générale de migration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      };
    }
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

  /**
   * Restaurer l'état de configuration depuis localStorage
   */
  private restoreConfigurationState(): void {
    try {
      const config = localStorage.getItem('hds-secure-config');
      if (config) {
        const parsed = JSON.parse(config);
        if (parsed.configured === true) {
          this.configured = true;
          console.log('🔄 État de configuration HDS sécurisé restauré depuis localStorage');
        }
      }
    } catch (error) {
      console.warn('⚠️ Impossible de restaurer l\'état de configuration:', error);
    }
  }
}

// Instance singleton
export const hdsSecureManager = new HDSSecureManager();