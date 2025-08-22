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
  private async getAdapter<T>(entityName: string, preferredLocation?: DataLocation): Promise<DataAdapter<T>> {
    // Classification des données HDS (OBLIGATOIREMENT locales EN PRODUCTION)
    const sensitiveHDSEntities = ['patients', 'appointments', 'invoices'];
    const isHDSEntity = sensitiveHDSEntities.includes(entityName);
    
    const targetLocation = preferredLocation || (isHDSEntity ? DataLocation.LOCAL : DataLocation.CLOUD);
    
    if (targetLocation === DataLocation.LOCAL || isHDSEntity) {
      const adapter = this.localAdapters.get(entityName);
      
      if (isHDSEntity) {
        // Vérifier si on est en mode démo via la session
        const { isDemoSession } = await import('@/utils/demo-detection');
        const isDemoMode = await isDemoSession();
        
        // En mode démo : Autoriser le stockage cloud UNIQUEMENT
        if (isDemoMode) {
          console.log(`🎭 Mode démo détecté pour ${entityName} - Utilisation stockage cloud éphémère`);
          const cloudAdapter = this.cloudAdapters.get(entityName);
          if (cloudAdapter) return cloudAdapter;
          throw new HybridStorageError(`❌ Aucun adaptateur cloud pour ${entityName} en mode démo`, DataLocation.CLOUD, 'getAdapter');
        }
        
        // EN MODE AUTHENTIFIÉ RÉEL: STOCKAGE LOCAL NATIF OBLIGATOIRE (OPFS/IndexedDB persistant)
        if (!adapter) {
          console.error(`❌ CONFORMITÉ HDS CRITIQUE: Aucun adaptateur local natif pour '${entityName}'`);
          throw new HybridStorageError(
            `❌ CONFORMITÉ HDS VIOLÉE: L'entité '${entityName}' DOIT être stockée dans le stockage local natif sécurisé (pas localStorage). Veuillez configurer votre stockage local.`,
            DataLocation.LOCAL,
            'getAdapter'
          );
        }
        
        console.log(`🛡️ Utilisation stockage local natif sécurisé pour '${entityName}' (OPFS/IndexedDB)`);
        return adapter;
      }
      
      // Pour les entités non-HDS, utiliser l'adaptateur local s'il existe, sinon cloud
      if (adapter) return adapter;
      
      // PAS DE FALLBACK - Si pas d'adaptateur local, utiliser cloud pour entités non-HDS
      const cloudAdapter = this.cloudAdapters.get(entityName);
      if (cloudAdapter) return cloudAdapter;
      
      throw new HybridStorageError(
        `❌ Aucun adaptateur disponible pour ${entityName}`,
        DataLocation.LOCAL,
        'getAdapter'
      );
    } else {
      // Entités cloud (users, osteopaths, etc.)
      const adapter = this.cloudAdapters.get(entityName);
      if (adapter) return adapter;
      
      throw new HybridStorageError(
        `❌ Aucun adaptateur cloud disponible pour ${entityName}`,
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
      const adapter = await this.getAdapter<T>(entityName);
      return await adapter.getAll();
    } catch (error) {
      console.error(`Error in getAll for ${entityName}:`, error);
      throw error;
    }
  }

  async getById<T>(entityName: string, id: number | string): Promise<T | null> {
    try {
      const adapter = await this.getAdapter<T>(entityName);
      return await adapter.getById(id);
    } catch (error) {
      console.error(`Error in getById for ${entityName}:`, error);
      return null;
    }
  }

  async create<T>(entityName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const adapter = await this.getAdapter<T>(entityName);
      const adapterLocation = adapter.getLocation();
      
      // Données HDS sensibles - Stockage local natif OBLIGATOIRE
      const sensitiveHDSEntities = ['patients', 'appointments', 'invoices'];
      const isHDSEntity = sensitiveHDSEntities.includes(entityName);
      
      if (isHDSEntity && adapterLocation === DataLocation.CLOUD) {
        // Vérifier si on est en mode démo avant de refuser
        const { isDemoSession } = await import('@/utils/demo-detection');
        const isDemoMode = await isDemoSession();
        
        // EN MODE IDENTIFIÉ RÉEL: REFUSER ABSOLUMENT le stockage cloud pour les données HDS
        if (!isDemoMode) {
          console.error(`❌ TENTATIVE DE STOCKAGE CLOUD POUR DONNÉES HDS: ${entityName}`);
          throw new HybridStorageError(
            `❌ ERREUR DE CONFORMITÉ HDS: Les données '${entityName}' ne peuvent PAS être stockées dans le cloud en mode authentifié. Stockage local natif OBLIGATOIRE.`,
            DataLocation.LOCAL,
            'create'
          );
        }
        
        // En mode démo, autoriser le stockage cloud
        console.log(`🎭 Mode démo - Autorisation stockage cloud pour ${entityName}`);
      }
      
      const result = await adapter.create(data);
      
      // Déclencher une sauvegarde automatique si activée
      if (this.config.backup.autoBackup && adapterLocation === DataLocation.LOCAL) {
        this.scheduleBackup();
      }
      
      return result;
    } catch (error) {
      console.error(`Error in create for ${entityName}:`, error);
      throw error;
    }
  }

  async update<T>(entityName: string, id: number | string, data: Partial<T>): Promise<T> {
    const adapter = await this.getAdapter<T>(entityName);
    const result = await adapter.update(id, data);
    
    // Déclencher une sauvegarde automatique si activée
    if (this.config.backup.autoBackup && this.getDataLocation(entityName) === DataLocation.LOCAL) {
      this.scheduleBackup();
    }
    
    return result;
  }

  async delete(entityName: string, id: number | string): Promise<boolean> {
    const adapter = await this.getAdapter<any>(entityName);
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
    // SEULES les données HDS sensibles sont stockées localement
    const hdsLocalEntities = ['patients', 'appointments', 'invoices'];
    return hdsLocalEntities.includes(entityName) ? DataLocation.LOCAL : DataLocation.CLOUD;
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