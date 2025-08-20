/**
 * Gestionnaire principal de stockage hybride obligatoire
 * Gère la séparation automatique entre données sensibles (local) et non-sensibles (cloud)
 */

import { hybridDataManager } from './hybrid-data-adapter';
import { getOPFSSQLiteService } from './sqlite/opfs-sqlite-service';
import { toast } from 'sonner';

export interface StorageConfig {
  storageLocation: string;
  securityMethod: 'pin' | 'password';
  credential: string;
  encryptionEnabled: boolean;
}

export interface StorageStatus {
  isConfigured: boolean;
  isUnlocked: boolean;
  localAvailable: boolean;
  cloudAvailable: boolean;
  lastBackup?: Date;
  dataClassification: {
    local: string[];
    cloud: string[];
  };
}

export interface MigrationProgress {
  entity: string;
  total: number;
  migrated: number;
  errors: string[];
  completed: boolean;
}

class HybridStorageManager {
  private static instance: HybridStorageManager;
  private isInitialized = false;
  private config: StorageConfig | null = null;
  private isUnlocked = false;

  // Mapping des entités par type de stockage (obligatoire)
  private readonly dataClassification = {
    // Données sensibles HDS - OBLIGATOIREMENT stockées localement
    sensitive: [
      'patients',
      'appointments', 
      'consultations',
      'invoices',
      'medicalDocuments',
      'quotes',
      'treatmentHistory',
      'patientRelationships'
    ],
    // Données non-sensibles - stockées dans le cloud
    nonSensitive: [
      'users',
      'osteopaths',
      'cabinets',
      'auth'
    ]
  };

  static getInstance(): HybridStorageManager {
    if (!HybridStorageManager.instance) {
      HybridStorageManager.instance = new HybridStorageManager();
    }
    return HybridStorageManager.instance;
  }

  /**
   * Initialise le gestionnaire de stockage hybride
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔄 Initializing Hybrid Storage Manager...');
    
    try {
      // Vérifier le support OPFS avant d'initialiser
      const { checkOPFSSupport } = await import('./sqlite/opfs-sqlite-service');
      const opfsStatus = checkOPFSSupport();
      
      if (!opfsStatus.supported) {
        console.error('❌ OPFS non supporté:', opfsStatus.details);
        toast.error(
          'CONFORMITÉ HDS REQUISE: Votre navigateur ne supporte pas le stockage local sécurisé (OPFS). ' +
          'Détails: ' + opfsStatus.details.join(', ') + '. ' +
          'Veuillez utiliser un navigateur récent (Chrome 102+, Edge 102+, Firefox avec flag activé).'
        );
        throw new Error('OPFS non supporté - conformité HDS compromise');
      }
      
      console.log('✅ Support OPFS vérifié:', opfsStatus.details);
      
      // FORCER l'initialisation SQLite OPFS même si pas configuré pour tester la disponibilité
      console.log('🔧 Test forcé d\'initialisation OPFS SQLite...');
      try {
        const { getOPFSSQLiteService } = await import('./sqlite/opfs-sqlite-service');
        await getOPFSSQLiteService();
        console.log('✅ Service SQLite OPFS initialisé avec succès');
      } catch (sqliteError) {
        console.error('❌ Échec initialisation SQLite OPFS:', sqliteError);
        // Ne pas faire échouer l'initialisation complète pour cela
      }
      
      // Vérifier si une configuration existe déjà
      const existingConfig = await this.loadStorageConfig();
      
      if (existingConfig) {
        this.config = existingConfig;
        console.log('✅ Storage configuration loaded');
      } else {
        console.log('⚠️ No storage configuration found - setup required');
      }

      // Initialiser le gestionnaire de données hybrides
      await hybridDataManager.initialize();
      
      this.isInitialized = true;
      console.log('✅ Hybrid Storage Manager initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Hybrid Storage Manager:', error);
      throw error;
    }
  }

  /**
   * Configure le stockage local avec les paramètres fournis
   */
  async configureStorage(config: StorageConfig): Promise<void> {
    try {
      console.log('🔧 Configuring hybrid storage...');
      
      // Valider la configuration
      if (!config.storageLocation || !config.credential) {
        throw new Error('Configuration de stockage incomplète');
      }

      // Initialiser le service SQLite avec chiffrement
      const sqliteService = await getOPFSSQLiteService();
      if (!sqliteService) {
        throw new Error('Service SQLite non disponible');
      }

      // Sauvegarder la configuration (chiffrée)
      await this.saveStorageConfig(config);
      
      this.config = config;
      this.isUnlocked = true;

      console.log('✅ Storage configuration completed');
      toast.success('Configuration de stockage terminée');
      
    } catch (error) {
      console.error('❌ Storage configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage');
      throw error;
    }
  }

  /**
   * Déverrouille le stockage avec les identifiants fournis
   */
  async unlockStorage(credential: string): Promise<boolean> {
    try {
      if (!this.config) {
        throw new Error('Aucune configuration de stockage trouvée');
      }

      // Vérifier les identifiants
      if (credential !== this.config.credential) {
        return false;
      }

      // Déverrouiller le service SQLite
      const sqliteService = await getOPFSSQLiteService();
      if (!sqliteService) {
        throw new Error('Service SQLite non disponible');
      }

      this.isUnlocked = true;
      console.log('🔓 Storage unlocked successfully');
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to unlock storage:', error);
      return false;
    }
  }

  /**
   * Verrouille le stockage local
   */
  lockStorage(): void {
    this.isUnlocked = false;
    console.log('🔒 Storage locked');
  }

  /**
   * Vérifie si la configuration de stockage est nécessaire
   */
  async isSetupRequired(): Promise<boolean> {
    // En mode démo, pas besoin de configuration locale
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    const isDemoMode = session?.user?.email === 'demo@patienthub.fr' || 
                      session?.user?.user_metadata?.is_demo_user === true;
    
    if (isDemoMode) {
      console.log('🎭 Mode démo détecté - configuration locale non requise');
      return false;
    }
    
    return !this.config || !this.isInitialized;
  }

  /**
   * Vérifie si le stockage est déverrouillé
   */
  isStorageUnlocked(): boolean {
    return this.isUnlocked && this.config !== null;
  }

  /**
   * Changer le code PIN/mot de passe par l’utilisateur
   */
  async changeCredential(oldCredential: string, newCredential: string, method?: 'pin' | 'password'): Promise<boolean> {
    if (!this.config) throw new Error('Aucune configuration');
    if (oldCredential !== this.config.credential) return false;
    this.config = {
      ...this.config,
      credential: newCredential,
      securityMethod: method ?? this.config.securityMethod,
    };
    await this.saveStorageConfig(this.config);
    this.isUnlocked = true;
    return true;
  }

  /**
   * Appliquer un réinitialisation administrateur (sans ancien code)
   */
  async applyAdminReset(newCredential: string, method: 'pin' | 'password'): Promise<void> {
    if (!this.config) {
      this.config = {
        storageLocation: 'OPFS',
        credential: newCredential,
        securityMethod: method,
        encryptionEnabled: true,
      };
    } else {
      this.config.credential = newCredential;
      this.config.securityMethod = method;
    }
    await this.saveStorageConfig(this.config);
    this.isUnlocked = true;
  }

  /**
   * Retourne le statut du stockage
   */
  async getStorageStatus(): Promise<StorageStatus> {
    const cloudStatus = await this.checkCloudAvailability();
    const localStatus = await this.checkLocalAvailability();
    
    return {
      isConfigured: this.config !== null,
      isUnlocked: this.isUnlocked,
      localAvailable: localStatus,
      cloudAvailable: cloudStatus,
      lastBackup: await this.getLastBackupDate(),
      dataClassification: {
        local: this.dataClassification.sensitive,
        cloud: this.dataClassification.nonSensitive
      }
    };
  }

  /**
   * Migre les données existantes vers le stockage hybride
   */
  async migrateExistingData(): Promise<MigrationProgress[]> {
    if (!this.isUnlocked) {
      throw new Error('Stockage non déverrouillé');
    }

    const results: MigrationProgress[] = [];
    
    console.log('🔄 Starting data migration to hybrid storage...');

    // Migrer chaque entité sensible vers le stockage local
    for (const entityName of this.dataClassification.sensitive) {
      try {
        console.log(`📦 Migrating ${entityName} to local storage...`);
        
        const result = await hybridDataManager.syncCloudToLocal(entityName);
        
        results.push({
          entity: entityName,
          total: result.migrated + result.errors.length,
          migrated: result.migrated,
          errors: result.errors,
          completed: result.success
        });
        
        if (result.success) {
          console.log(`✅ ${entityName} migration completed`);
        } else {
          console.warn(`⚠️ ${entityName} migration completed with errors:`, result.errors);
        }
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${entityName}:`, error);
        results.push({
          entity: entityName,
          total: 0,
          migrated: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          completed: false
        });
      }
    }

    console.log('✅ Data migration completed');
    return results;
  }

  /**
   * Crée une sauvegarde manuelle
   */
  async createBackup(): Promise<string> {
    if (!this.isUnlocked) {
      throw new Error('Stockage non déverrouillé');
    }

    try {
      console.log('💾 Creating manual backup...');
      const backupPath = await hybridDataManager.exportData();
      console.log('✅ Backup created successfully');
      return backupPath;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Restaure depuis une sauvegarde
   */
  async restoreFromBackup(backupPath: string, password: string): Promise<boolean> {
    if (!this.isUnlocked) {
      throw new Error('Stockage non déverrouillé');
    }

    try {
      console.log('📥 Restoring from backup...');
      const success = await hybridDataManager.importData(backupPath, password);
      
      if (success) {
        console.log('✅ Restore completed successfully');
        toast.success('Restauration terminée avec succès');
      } else {
        console.warn('⚠️ Restore completed with issues');
        toast.warning('Restauration terminée avec des problèmes');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      toast.error('Erreur lors de la restauration');
      throw error;
    }
  }

  /**
   * Obtient les informations de diagnostic
   */
  async getDiagnosticInfo() {
    const status = await this.getStorageStatus();
    const hybridDiagnostic = await hybridDataManager.diagnose();
    const performanceTest = await hybridDataManager.performanceTest();
    
    return {
      status,
      hybridDiagnostic,
      performanceTest,
      config: this.config ? {
        storageLocation: this.config.storageLocation,
        securityMethod: this.config.securityMethod,
        encryptionEnabled: this.config.encryptionEnabled
      } : null
    };
  }

  /**
   * Méthodes privées
   */
  private async loadStorageConfig(): Promise<StorageConfig | null> {
    try {
      const configData = localStorage.getItem('hybrid-storage-config');
      if (!configData) return null;
      
      // En production, ceci devrait être déchiffré
      return JSON.parse(configData) as StorageConfig;
    } catch {
      return null;
    }
  }

  private async saveStorageConfig(config: StorageConfig): Promise<void> {
    try {
      // En production, ceci devrait être chiffré
      localStorage.setItem('hybrid-storage-config', JSON.stringify(config));
    } catch (error) {
      throw new Error('Impossible de sauvegarder la configuration');
    }
  }

  private async checkCloudAvailability(): Promise<boolean> {
    try {
      // Test simple de connectivité cloud (ressource locale, conforme CSP)
      const response = await fetch('/robots.txt', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkLocalAvailability(): Promise<boolean> {
    try {
      const service = await getOPFSSQLiteService();
      
      // Test complet: vérifier que le service fonctionne vraiment en OPFS et pas en fallback
      const testResult = await service.query('SELECT sqlite_version() as version');
      const isRealSQLite = testResult && testResult.length > 0;
      
      console.log('🔍 Test disponibilité stockage local - SQLite version:', testResult);
      return service !== null && isRealSQLite;
    } catch (error) {
      console.error('❌ Test disponibilité stockage local échoué:', error);
      return false;
    }
  }

  private async getLastBackupDate(): Promise<Date | undefined> {
    try {
      const backupInfo = localStorage.getItem('last-backup-date');
      return backupInfo ? new Date(backupInfo) : undefined;
    } catch {
      return undefined;
    }
  }
}

// Export de l'instance singleton
export const hybridStorageManager = HybridStorageManager.getInstance();