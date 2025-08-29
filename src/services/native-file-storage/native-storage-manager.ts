import { NativeFileAdapter, requestStorageDirectory } from './native-file-adapter';

export interface NativeStorageConfig {
  directoryHandle?: FileSystemDirectoryHandle;
  encryptionKey?: string;
  entities?: string[];
  securityMethod?: 'pin' | 'password';
}

export interface NativeStorageStatus {
  isConfigured: boolean;
  isUnlocked: boolean;
  localAvailable: boolean;
  cloudAvailable: boolean;
  entitiesCount: Record<string, number>;
  totalSize: number;
}

export class NativeStorageManager {
  private adapters: Map<string, NativeFileAdapter> = new Map();
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private encryptionKey: string | null = null;
  private configured: boolean = false;
  private unlocked: boolean = false;

  /**
   * Générer une clé de chiffrement sécurisée
   */
  private generateEncryptionKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    console.log('🔐 Clé de cryptage générée:', key.substring(0, 8) + '...');
    return key;
  }

  /**
   * Vérifier automatiquement si un stockage existant peut être utilisé
   */
  async autoConfigureIfExists(): Promise<boolean> {
    const existingConfig = localStorage.getItem('native-storage-config');
    if (!existingConfig) return false;

    try {
      const parsed = JSON.parse(existingConfig);
      if (!parsed.configured) return false;

      console.log('🔍 Configuration existante détectée, tentative d\'accès automatique...');
      
      // Vérifier le support
      const support = this.checkSupport();
      if (!support.supported) {
        console.warn('⚠️ Stockage natif plus supporté, reset nécessaire');
        await this.reset();
        return false;
      }

      // Tenter de restaurer la configuration
      this.configured = true;
      this.unlocked = false; // Nécessitera déverrouillage

      console.log('✅ Configuration automatique réussie, déverrouillage requis');
      return true;
    } catch (error) {
      console.error('❌ Erreur configuration automatique:', error);
      await this.reset();
      return false;
    }
  }

  /**
   * Vérifier le support du stockage natif
   */
  checkSupport(): { supported: boolean; details: string[] } {
    const details: string[] = [];
    
    if (!('showDirectoryPicker' in window)) {
      details.push('File System Access API non supporté');
    }
    
    if (!('crypto' in window)) {
      details.push('API de cryptographie non disponible');
    }
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      details.push('HTTPS requis pour le stockage natif');
    }

    return {
      supported: details.length === 0,
      details
    };
  }

  /**
   * Configurer le stockage natif
   */
  async configure(config?: Partial<NativeStorageConfig>): Promise<void> {
    console.log('⚙️ Configuration du stockage natif...');
    
    const support = this.checkSupport();
    if (!support.supported) {
      throw new Error('Stockage natif non supporté: ' + support.details.join(', '));
    }

    try {
      // Vérifier si un répertoire existant est déjà enregistré
      const existingConfig = localStorage.getItem('native-storage-config');
      let directoryHandle = null;

      if (existingConfig) {
        try {
          const parsed = JSON.parse(existingConfig);
          if (parsed.configured && parsed.directoryHandle) {
            // Tenter de récupérer le handle existant
            console.log('🔄 Tentative récupération du répertoire existant...');
            // Note: en réalité, on ne peut pas sérialiser/désérialiser les handles
            // Il faudra demander un nouveau répertoire
          }
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer le répertoire existant:', error);
        }
      }

      // Si pas de répertoire existant, en demander un nouveau
      if (!directoryHandle) {
        console.log('📁 Demande d\'accès à un nouveau répertoire...');
        directoryHandle = await requestStorageDirectory();
        this.directoryHandle = directoryHandle;
      }

      // Générer une clé de chiffrement sécurisée
      if (config?.encryptionKey) {
        this.encryptionKey = config.encryptionKey;
      } else {
        this.encryptionKey = this.generateEncryptionKey();
      }

      // Initialiser les adaptateurs pour chaque entité
      const entities = config?.entities || ['patients', 'appointments', 'invoices'];
      
      for (const entityName of entities) {
        const adapter = new NativeFileAdapter(entityName);
        await adapter.initialize(this.directoryHandle, this.encryptionKey);
        this.adapters.set(entityName, adapter);
        console.log(`✅ Adaptateur ${entityName} initialisé avec cryptage`);
      }

      // Marquer comme configuré
      this.configured = true;
      this.unlocked = true;

      // Sauvegarder la configuration
      const configToSave = {
        configured: true,
        entities,
        timestamp: Date.now(),
        encrypted: true
      };

      localStorage.setItem('native-storage-config', JSON.stringify(configToSave));

      console.log('✅ Stockage natif configuré avec succès et cryptage activé');
    } catch (error) {
      console.error('❌ Erreur configuration stockage natif:', error);
      throw error;
    }
  }

  /**
   * Obtenir le statut du stockage
   */
  async getStatus(): Promise<NativeStorageStatus> {
    const entitiesCount: Record<string, number> = {};
    let totalSize = 0;

    if (this.configured && this.unlocked) {
      for (const [entityName, adapter] of this.adapters) {
        try {
          const stats = await adapter.getStorageStats();
          entitiesCount[entityName] = stats.count;
          totalSize += stats.size;
        } catch (error) {
          console.warn(`Erreur lors de la récupération des stats pour ${entityName}:`, error);
          entitiesCount[entityName] = 0;
        }
      }
    }

    return {
      isConfigured: this.configured,
      isUnlocked: this.unlocked,
      localAvailable: this.configured,
      cloudAvailable: true, // Toujours disponible via Supabase
      entitiesCount,
      totalSize
    };
  }

  /**
   * Obtenir un adaptateur pour une entité
   */
  getAdapter(entityName: string): NativeFileAdapter | null {
    if (!this.unlocked) {
      console.warn(`🔒 Stockage verrouillé - impossible d'accéder à ${entityName}`);
      return null;
    }
    
    return this.adapters.get(entityName) || null;
  }

  /**
   * Verrouiller le stockage
   */
  lock(): void {
    this.unlocked = false;
    console.log('🔒 Stockage natif verrouillé');
  }

  /**
   * Déverrouiller le stockage
   */
  async unlock(credential?: string): Promise<boolean> {
    if (!this.configured) {
      console.warn('⚠️ Stockage non configuré');
      return false;
    }

    // Pour la démo, toujours réussir
    // En production, vérifier le credential
    this.unlocked = true;
    console.log('🔓 Stockage natif déverrouillé');
    return true;
  }

  /**
   * Exporter toutes les données
   */
  async exportAllData(): Promise<void> {
    if (!this.unlocked) {
      throw new Error('Stockage verrouillé');
    }

    console.log('📦 Export de toutes les données...');
    
    for (const [entityName, adapter] of this.adapters) {
      try {
        await adapter.exportData();
        console.log(`✅ Export ${entityName} réussi`);
      } catch (error) {
        console.error(`❌ Erreur export ${entityName}:`, error);
      }
    }
  }

  /**
   * Réinitialiser complètement le stockage
   */
  async reset(): Promise<void> {
    console.log('🗑️ Réinitialisation du stockage natif...');
    
    this.adapters.clear();
    this.directoryHandle = null;
    this.encryptionKey = null;
    this.configured = false;
    this.unlocked = false;
    
    localStorage.removeItem('native-storage-config');
    
    console.log('✅ Stockage natif réinitialisé');
  }

  /**
   * Vérifier si le stockage est configuré (depuis localStorage)
   */
  isConfiguredFromStorage(): boolean {
    const config = localStorage.getItem('native-storage-config');
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
export const nativeStorageManager = new NativeStorageManager();