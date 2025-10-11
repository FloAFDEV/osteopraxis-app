/**
 * 🔐 Factory pour sélection automatique du backend de stockage
 * 
 * FSA (File System Access) → prioritaire si disponible (Chrome/Edge)
 * IndexedDB chiffré → fallback automatique (Safari/Firefox)
 */

import { SecureStorageBackend, SecureStorageConfig, SecureStorageType } from './interfaces';
import { FSASecureStorage } from './fsa-secure-storage';
import { IndexedDBSecureStorage } from './indexeddb-secure-storage';
import { isInIframe, getExecutionContext } from '@/utils/iframe-detection';

export class SecureStorageFactory {
  
  /**
   * Détecter le meilleur backend disponible
   */
  static detectBestBackend(): SecureStorageType {
    const context = getExecutionContext();
    
    // Si on est dans un iframe, utiliser directement IndexedDB
    if (context.isIframe) {
      if ('indexedDB' in window) {
        console.log('🖼️ Mode iframe - Backend IndexedDB chiffré');
        return 'IndexedDB';
      }
      throw new Error('❌ IndexedDB non disponible dans cet iframe');
    }
    
    // FSA prioritaire si disponible (hors iframe)
    if ('showDirectoryPicker' in window) {
      console.log('🗂️ File System Access détecté - Backend prioritaire');
      return 'FSA';
    }
    
    // Fallback vers IndexedDB
    if ('indexedDB' in window) {
      console.log('💾 IndexedDB détecté - Backend fallback');
      return 'IndexedDB';
    }
    
    throw new Error('❌ Aucun backend de stockage sécurisé supporté');
  }

  /**
   * Obtenir le contexte de stockage
   */
  static detectStorageContext(): {
    isIframe: boolean;
    hasFileSystemAccess: boolean;
    hasIndexedDB: boolean;
    recommendedBackend: SecureStorageType;
  } {
    const context = getExecutionContext();
    const hasFileSystemAccess = 'showDirectoryPicker' in window && !context.isIframe;
    const hasIndexedDB = 'indexedDB' in window;
    
    return {
      isIframe: context.isIframe,
      hasFileSystemAccess,
      hasIndexedDB,
      recommendedBackend: context.recommendedBackend
    };
  }

  /**
   * Créer une instance du meilleur backend disponible
   */
  static async createSecureStorage(config: SecureStorageConfig): Promise<{
    storage: SecureStorageBackend;
    type: SecureStorageType;
  }> {
    const type = this.detectBestBackend();
    let storage: SecureStorageBackend;
    
    switch (type) {
      case 'FSA':
        storage = new FSASecureStorage();
        break;
        
      case 'IndexedDB':
        storage = new IndexedDBSecureStorage();
        break;
        
      default:
        throw new Error(`Backend ${type} non supporté`);
    }
    
    // Configuration
    await storage.configure(config);
    
    return { storage, type };
  }

  /**
   * Tester la disponibilité d'un backend spécifique
   */
  static async testBackendAvailability(type: SecureStorageType): Promise<boolean> {
    try {
      switch (type) {
        case 'FSA':
          const fsaStorage = new FSASecureStorage();
          return await fsaStorage.isAvailable();
          
        case 'IndexedDB':
          const idbStorage = new IndexedDBSecureStorage();
          return await idbStorage.isAvailable();
          
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Obtenir des informations sur les backends disponibles
   */
  static async getBackendsInfo(): Promise<{
    FSA: { available: boolean; priority: number; description: string };
    IndexedDB: { available: boolean; priority: number; description: string };
    recommended: SecureStorageType;
  }> {
    const fsaAvailable = await this.testBackendAvailability('FSA');
    const idbAvailable = await this.testBackendAvailability('IndexedDB');
    
    const recommended = fsaAvailable ? 'FSA' : 'IndexedDB';
    
    return {
      FSA: {
        available: fsaAvailable,
        priority: 1,
        description: 'Stockage dans dossier local (Chrome/Edge) - Recommandé'
      },
      IndexedDB: {
        available: idbAvailable,
        priority: 2,
        description: 'Stockage navigateur chiffré (Safari/Firefox) - Fallback'
      },
      recommended
    };
  }
}

/**
 * Instance globale du storage sécurisé
 */
let globalSecureStorage: SecureStorageBackend | null = null;
let globalStorageType: SecureStorageType | null = null;

export const SecureStorageManager = {
  
  /**
   * Configurer le storage global
   */
  async configure(config: SecureStorageConfig): Promise<void> {
    const { storage, type } = await SecureStorageFactory.createSecureStorage(config);
    globalSecureStorage = storage;
    globalStorageType = type;
    
    console.log(`✅ Storage global configuré avec backend ${type}`);
  },

  /**
   * Obtenir l'instance du storage global
   */
  getStorage(): SecureStorageBackend {
    if (!globalSecureStorage) {
      throw new Error('Storage sécurisé non configuré. Appelez configure() d\'abord.');
    }
    return globalSecureStorage;
  },

  /**
   * Obtenir le type de backend actuel
   */
  getStorageType(): SecureStorageType {
    if (!globalStorageType) {
      throw new Error('Storage sécurisé non configuré');
    }
    return globalStorageType;
  },

  /**
   * Vérifier si le storage est configuré
   */
  isConfigured(): boolean {
    return globalSecureStorage !== null;
  },

  /**
   * Réinitialiser le storage global
   */
  reset(): void {
    globalSecureStorage = null;
    globalStorageType = null;
    console.log('🔄 Storage global réinitialisé');
  }
};