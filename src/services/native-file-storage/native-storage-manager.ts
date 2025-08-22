/**
 * Gestionnaire de stockage natif pour utilisateurs connectés
 * Utilise File System Access API pour stockage HDS local + Supabase pour non-HDS
 */

import { NativeFileAdapter, checkNativeStorageSupport, requestStorageDirectory } from './native-file-adapter';

export interface NativeStorageConfig {
  directoryHandle?: FileSystemDirectoryHandle;
  encryptionKey?: string;
  entities?: string[];
  storageLocation?: string;
  securityMethod?: 'pin' | 'password';
  credential?: string;
}

export interface NativeStorageStatus {
  isConfigured: boolean;
  isUnlocked: boolean;
  localAvailable: boolean;
  cloudAvailable: boolean;
  entitiesCount: Record<string, number>;
  totalSize: number;
  lastBackup?: string;
}

export class NativeStorageManager {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private encryptionKey: string | null = null;
  private adapters: Map<string, NativeFileAdapter> = new Map();
  private configured = false;
  private unlocked = false;

  /**
   * Vérifier le support du stockage natif
   */
  checkSupport() {
    return checkNativeStorageSupport();
  }

  /**
   * Configurer le stockage natif
   */
  async configure(config?: Partial<NativeStorageConfig>): Promise<void> {
    try {
      console.log('🚀 Configuration du stockage natif...');
      
      // Vérifier le support
      const support = this.checkSupport();
      if (!support.supported) {
        throw new Error(`Stockage natif non supporté: ${support.details.join(', ')}`);
      }

      // Demander l'accès au dossier si pas fourni
      if (!config?.directoryHandle) {
        this.directoryHandle = await requestStorageDirectory();
      } else {
        this.directoryHandle = config.directoryHandle;
      }

      // Configurer le chiffrement
      this.encryptionKey = config?.encryptionKey || null;

      // Créer les adaptateurs pour les entités HDS
      const entities = config?.entities || ['patients', 'appointments', 'invoices'];
      
      for (const entity of entities) {
        const adapter = new NativeFileAdapter(entity);
        await adapter.initialize(this.directoryHandle, this.encryptionKey);
        this.adapters.set(entity, adapter);
      }

      this.configured = true;
      this.unlocked = true;

      console.log('✅ Stockage natif configuré avec succès');
      
      // Sauvegarder la configuration (sans le handle de fichier)
      localStorage.setItem('native-storage-config', JSON.stringify({
        configured: true,
        entities,
        hasEncryption: !!this.encryptionKey
      }));

    } catch (error) {
      console.error('❌ Erreur configuration stockage natif:', error);
      this.configured = false;
      this.unlocked = false;
      throw error;
    }
  }

  /**
   * Obtenir le statut du stockage
   */
  async getStatus(): Promise<NativeStorageStatus> {
    if (!this.configured) {
      return {
        isConfigured: false,
        isUnlocked: false,
        localAvailable: false,
        cloudAvailable: true, // Supabase toujours disponible
        entitiesCount: {},
        totalSize: 0
      };
    }

    const entitiesCount: Record<string, number> = {};
    let totalSize = 0;

    for (const [entityName, adapter] of this.adapters) {
      try {
        const stats = await adapter.getStorageStats();
        entitiesCount[entityName] = stats.count;
        totalSize += stats.size;
      } catch (error) {
        console.warn(`⚠️ Erreur stats ${entityName}:`, error);
        entitiesCount[entityName] = 0;
      }
    }

    return {
      isConfigured: this.configured,
      isUnlocked: this.unlocked,
      localAvailable: this.configured && this.unlocked,
      cloudAvailable: true,
      entitiesCount,
      totalSize,
      lastBackup: undefined
    };
  }

  /**
   * Obtenir un adaptateur pour une entité
   */
  getAdapter(entityName: string): NativeFileAdapter | null {
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