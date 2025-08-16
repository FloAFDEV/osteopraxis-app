import { DataLocation, DataAdapter, HybridConfig, HybridStorageError, LocalStorageStatus } from './types';

/**
 * Adaptateur principal qui route les opérations vers Supabase ou SQLite
 * selon la classification des données
 */
export class HybridDataAdapter {
  private config: HybridConfig;
  private cloudAdapters: Map<string, DataAdapter<any>> = new Map();
  private localAdapters: Map<string, DataAdapter<any>> = new Map();
  
  constructor(config: HybridConfig) {
    this.config = config;
  }

  /**
   * Enregistre un adaptateur cloud (Supabase)
   */
  registerCloudAdapter<T>(entityName: string, adapter: DataAdapter<T>) {
    this.cloudAdapters.set(entityName, adapter);
  }

  /**
   * Enregistre un adaptateur local (SQLite)
   */
  registerLocalAdapter<T>(entityName: string, adapter: DataAdapter<T>) {
    this.localAdapters.set(entityName, adapter);
  }

  /**
   * Obtient l'adaptateur approprié selon le type de données
   */
  private getAdapter<T>(entityName: string, preferredLocation?: DataLocation): DataAdapter<T> {
    // Classification des données HDS (OBLIGATOIREMENT locales EN PRODUCTION)
    const sensitiveHDSEntities = ['patients', 'appointments', 'consultations', 'invoices', 'medicalDocuments', 'quotes', 'treatmentHistory', 'patientRelationships'];
    const isHDSEntity = sensitiveHDSEntities.includes(entityName);
    
    const targetLocation = preferredLocation || (isHDSEntity ? DataLocation.LOCAL : DataLocation.CLOUD);
    
    if (targetLocation === DataLocation.LOCAL || isHDSEntity) {
      const adapter = this.localAdapters.get(entityName);
      if (adapter) return adapter;
      
      // CONFORMITÉ HDS: En développement, fallback vers cloud autorisé
      if (isHDSEntity && this.config.fallbackToCloud) {
        console.warn(`⚠️ DÉVELOPPEMENT: Données HDS '${entityName}' stockées temporairement dans le cloud`);
        const cloudAdapter = this.cloudAdapters.get(entityName);
        if (cloudAdapter) return cloudAdapter;
      }
      
      // En production, pas de fallback cloud pour les données sensibles
      if (isHDSEntity && !this.config.fallbackToCloud) {
        throw new HybridStorageError(
          `❌ CONFORMITÉ HDS VIOLÉE: Les données sensibles '${entityName}' ne peuvent pas être stockées dans le cloud. Le stockage local SQLite/OPFS est OBLIGATOIRE.`,
          DataLocation.LOCAL,
          'getAdapter'
        );
      }
      
      // Pour les entités non-HDS, fallback possible vers cloud
      if (this.config.fallbackToCloud) {
        console.warn(`Fallback to cloud for ${entityName} - local storage not available`);
        const cloudAdapter = this.cloudAdapters.get(entityName);
        if (cloudAdapter) return cloudAdapter;
      }
      
      throw new HybridStorageError(
        `No adapter available for ${entityName}`,
        DataLocation.LOCAL,
        'getAdapter'
      );
    } else {
      const adapter = this.cloudAdapters.get(entityName);
      if (adapter) return adapter;
      
      throw new HybridStorageError(
        `No cloud adapter available for ${entityName}`,
        DataLocation.CLOUD,
        'getAdapter'
      );
    }
  }

  /**
   * Interface unifiée pour les opérations CRUD
   */
  async getAll<T>(entityName: string): Promise<T[]> {
    try {
      const adapter = this.getAdapter<T>(entityName);
      return await adapter.getAll();
    } catch (error) {
      console.error(`Error in getAll for ${entityName}:`, error);
      throw error;
    }
  }

  async getById<T>(entityName: string, id: number | string): Promise<T | null> {
    try {
      const adapter = this.getAdapter<T>(entityName);
      return await adapter.getById(id);
    } catch (error) {
      console.error(`Error in getById for ${entityName}:`, error);
      return null;
    }
  }

  async create<T>(entityName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const adapter = this.getAdapter<T>(entityName);
      const result = await adapter.create(data);
      
      // Déclencher une sauvegarde automatique si activée
      if (this.config.backup.autoBackup && this.getDataLocation(entityName) === DataLocation.LOCAL) {
        this.scheduleBackup();
      }
      
      return result;
    } catch (error) {
      console.error(`Error in create for ${entityName}:`, error);
      throw error;
    }
  }

  async update<T>(entityName: string, id: number | string, data: Partial<T>): Promise<T> {
    const adapter = this.getAdapter<T>(entityName);
    const result = await adapter.update(id, data);
    
    // Déclencher une sauvegarde automatique si activée
    if (this.config.backup.autoBackup && this.getDataLocation(entityName) === DataLocation.LOCAL) {
      this.scheduleBackup();
    }
    
    return result;
  }

  async delete(entityName: string, id: number | string): Promise<boolean> {
    const adapter = this.getAdapter<any>(entityName);
    const result = await adapter.delete(id);
    
    // Déclencher une sauvegarde automatique si activée
    if (this.config.backup.autoBackup && this.getDataLocation(entityName) === DataLocation.LOCAL) {
      this.scheduleBackup();
    }
    
    return result;
  }

  /**
   * Utilitaires de gestion
   */
  private getDataLocation(entityName: string): DataLocation {
    const localEntities = ['patients', 'appointments', 'consultations', 'invoices', 'medicalDocuments', 'quotes', 'treatmentHistory', 'patientRelationships'];
    return localEntities.includes(entityName) ? DataLocation.LOCAL : DataLocation.CLOUD;
  }

  async getStorageStatus(): Promise<{cloud: boolean, local: LocalStorageStatus}> {
    const cloudStatus = this.cloudAdapters.size > 0;
    
    // Vérifier le statut du stockage local
    const localStatus: LocalStorageStatus = {
      available: this.localAdapters.size > 0,
      encrypted: this.config.encryption.enabled,
      size: 0, // À calculer avec SQLite
      tables: Array.from(this.localAdapters.keys())
    };

    return { cloud: cloudStatus, local: localStatus };
  }

  private backupTimeout?: NodeJS.Timeout;
  
  private scheduleBackup() {
    if (this.backupTimeout) {
      clearTimeout(this.backupTimeout);
    }
    
    this.backupTimeout = setTimeout(() => {
      this.performBackup();
    }, this.config.backup.backupInterval * 60 * 1000);
  }

  private async performBackup() {
    // À implémenter : logique de sauvegarde chiffrée
    console.log('Performing automatic backup...');
  }

  /**
   * Force une synchronisation/sauvegarde manuelle
   */
  async manualBackup(): Promise<string> {
    // À implémenter : export chiffré des données locales
    return 'backup-file-path';
  }

  /**
   * Restaure depuis une sauvegarde
   */
  async restoreFromBackup(backupPath: string, password: string): Promise<boolean> {
    // À implémenter : import et déchiffrement
    return true;
  }
}