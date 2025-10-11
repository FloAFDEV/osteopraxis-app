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
import { checkCryptoSupport, testCrypto, encryptJSON, decryptJSON } from '@/utils/crypto';
import { isInIframe, getExecutionContext } from '@/utils/iframe-detection';

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
    const context = getExecutionContext();
    const cryptoSupport = checkCryptoSupport();
    const persistenceSupport = checkPersistenceSupport();
    
    // Si on est dans un iframe, on ignore FSA et on utilise IndexedDB
    if (context.isIframe) {
      console.log('🖼️ Contexte iframe détecté - Utilisation IndexedDB chiffré');
      
      const allDetails = [
        ...cryptoSupport.details,
        ...persistenceSupport.details
      ];
      
      const supported = cryptoSupport.supported && persistenceSupport.supported;
      
      if (supported) {
        allDetails.push('✅ IndexedDB chiffré disponible pour iframe');
      }
      
      return { supported, details: allDetails, context };
    }
    
    // Mode normal - FSA prioritaire
    const nativeSupport = checkNativeStorageSupport();
    
    const allDetails = [
      ...nativeSupport.details,
      ...cryptoSupport.details,
      ...persistenceSupport.details
    ];
    
    const supported = nativeSupport.supported && cryptoSupport.supported && persistenceSupport.supported;
    
    return { supported, details: allDetails, context };
  }

  /**
   * Configurer le stockage HDS sécurisé
   */
  async configure(config: HDSSecureConfig): Promise<void> {
    try {
      const context = getExecutionContext();
      
      if (context.isIframe) {
        console.log('🖼️ Mode iframe détecté - Configuration IndexedDB chiffré...');
      } else {
        console.log('🔐 Configuration du stockage HDS sécurisé...');
      }
      
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
        if (context.isIframe) {
          console.log('🖼️ Utilisation OPFS dans iframe (IndexedDB backend)...');
        } else {
          console.log('📁 Utilisation de l\'OPFS (Origin Private File System)...');
        }
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
   * Exporter toutes les données HDS de façon sécurisée (fichier unique consolidé)
   */
  async exportAllSecure(): Promise<void> {
    if (!this.unlocked) {
      throw new Error('Stockage HDS verrouillé');
    }

    console.log('📦 Export sécurisé consolidé de toutes les données HDS...');
    
    try {
      // Collecter toutes les données de toutes les entités
      const allData: Record<string, any[]> = {};
      let totalRecords = 0;
      
      for (const [entityName, storage] of this.storages) {
        try {
          const records = await storage.loadRecords();
          allData[entityName] = records;
          totalRecords += records.length;
          console.log(`✅ ${records.length} enregistrements ${entityName} collectés`);
        } catch (error) {
          console.error(`❌ Erreur collecte ${entityName}:`, error);
          allData[entityName] = [];
        }
      }
      
      // Créer le fichier consolidé
      const consolidatedExport = {
        format: 'PatientHub_Full_Backup_v2',
        exportedAt: new Date().toISOString(),
        totalRecords,
        entities: Object.keys(allData),
        data: await encryptJSON(allData, this.password!),
        metadata: {
          version: '2.0',
          entityCounts: Object.entries(allData).reduce((acc, [key, val]) => {
            acc[key] = val.length;
            return acc;
          }, {} as Record<string, number>)
        },
        instructions: 'Sauvegarde complète PatientHub chiffrée. Import possible uniquement avec le mot de passe correct.'
      };

      const jsonString = JSON.stringify(consolidatedExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Export avec File System Access API si disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `patienthub_backup_${new Date().toISOString().split('T')[0]}.phds`,
          types: [{
            description: 'Sauvegarde PatientHub HDS Complète',
            accept: { 'application/json': ['.phds'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        console.log(`✅ Export consolidé réussi: ${totalRecords} enregistrements dans ${Object.keys(allData).length} entités`);
      } else {
        // Fallback téléchargement classique
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patienthub_backup_${new Date().toISOString().split('T')[0]}.phds`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('❌ Erreur export consolidé:', error);
      throw error;
    }
  }

  /**
   * Importer toutes les données HDS depuis une sauvegarde complète
   */
  async importAllSecure(file: File, password: string, strategy: 'replace' | 'merge' = 'merge'): Promise<{
    imported: Record<string, number>;
    errors: string[];
    warnings: string[];
  }> {
    if (!this.unlocked) {
      throw new Error('Stockage HDS verrouillé');
    }

    const result = {
      imported: {} as Record<string, number>,
      errors: [] as string[],
      warnings: [] as string[]
    };

    try {
      console.log('📥 Import sécurisé consolidé depuis', file.name);
      
      // Lire et parser le fichier
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      // Vérifier le format
      if (!backupData.format || !backupData.format.includes('PatientHub')) {
        throw new Error('Format de fichier invalide - doit être une sauvegarde PatientHub .phds');
      }
      
      // Déchiffrer toutes les données
      console.log('🔓 Déchiffrement des données...');
      const decrypted = await decryptJSON(backupData.data, password);
      
      // Importer chaque entité
      for (const [entityName, records] of Object.entries(decrypted)) {
        const storage = this.storages.get(entityName);
        
        if (!storage) {
          result.warnings.push(`Entité ${entityName} non configurée - ignorée`);
          continue;
        }
        
        try {
          console.log(`📥 Import ${entityName}...`);
          
          // Créer un fichier temporaire virtuel pour utiliser la méthode importSecure
          const entityData = {
            format: 'PatientHub_HDS_Secure_Export_v2',
            entity: entityName,
            exportedAt: backupData.exportedAt,
            recordCount: (records as any[]).length,
            data: await encryptJSON({ records }, password),
            instructions: 'Données extraites de sauvegarde complète'
          };
          
          const entityBlob = new Blob([JSON.stringify(entityData)], { type: 'application/json' });
          const entityFile = new File([entityBlob], `${entityName}.phds`);
          
          const importResult = await storage.importSecure(entityFile, password, strategy);
          
          result.imported[entityName] = importResult.imported;
          result.errors.push(...importResult.errors.map(e => `[${entityName}] ${e}`));
          result.warnings.push(...importResult.warnings.map(w => `[${entityName}] ${w}`));
          
          console.log(`✅ Import ${entityName} réussi: ${importResult.imported} enregistrements`);
          
        } catch (error) {
          console.error(`❌ Erreur import ${entityName}:`, error);
          result.errors.push(`[${entityName}] ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }
      
      console.log('✅ Import consolidé terminé');
      
    } catch (error) {
      console.error('❌ Erreur import consolidé:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('decrypt')) {
          result.errors.push('Mot de passe incorrect pour déchiffrer la sauvegarde');
        } else {
          result.errors.push(error.message);
        }
      } else {
        result.errors.push('Erreur inconnue lors de l\'import');
      }
    }

    return result;
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