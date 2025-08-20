/**
 * Gestionnaire de compartimentage et nettoyage automatique des données
 * Sépare les données par session et nettoie automatiquement après 30 minutes
 */

import { toast } from 'sonner';

interface CompartmentConfig {
  sessionId: string;
  userId: string;
  timestamp: number;
  autoCleanup: boolean;
  cleanupInterval?: number; // en minutes
}

interface DataCompartment {
  config: CompartmentConfig;
  data: Map<string, any[]>;
  cleanupTimer?: NodeJS.Timeout;
}

class DataCompartmentManager {
  private static instance: DataCompartmentManager;
  private compartments: Map<string, DataCompartment> = new Map();
  private defaultCleanupInterval = 30; // 30 minutes

  static getInstance(): DataCompartmentManager {
    if (!DataCompartmentManager.instance) {
      DataCompartmentManager.instance = new DataCompartmentManager();
    }
    return DataCompartmentManager.instance;
  }

  /**
   * Crée un nouveau compartiment de données pour une session
   */
  createCompartment(config: CompartmentConfig): string {
    const compartmentId = `${config.userId}-${config.sessionId}-${Date.now()}`;
    
    const compartment: DataCompartment = {
      config: {
        ...config,
        cleanupInterval: config.cleanupInterval || this.defaultCleanupInterval
      },
      data: new Map(),
    };

    // Programmer le nettoyage automatique si activé
    if (config.autoCleanup) {
      compartment.cleanupTimer = setTimeout(() => {
        this.cleanupCompartment(compartmentId);
      }, (config.cleanupInterval || this.defaultCleanupInterval) * 60 * 1000);
    }

    this.compartments.set(compartmentId, compartment);
    
    console.log(`🗂️ Compartiment créé: ${compartmentId} (nettoyage dans ${compartment.config.cleanupInterval}min)`);
    
    return compartmentId;
  }

  /**
   * Stocke des données dans un compartiment spécifique
   */
  storeData(compartmentId: string, entityType: string, data: any[]): void {
    const compartment = this.compartments.get(compartmentId);
    if (!compartment) {
      console.error(`❌ Compartiment non trouvé: ${compartmentId}`);
      return;
    }

    // Ajouter un timestamp aux données pour traçabilité
    const timestampedData = data.map(item => ({
      ...item,
      _compartmentTimestamp: Date.now(),
      _compartmentId: compartmentId
    }));

    compartment.data.set(entityType, timestampedData);
    
    console.log(`📦 Données stockées dans compartiment ${compartmentId}: ${entityType} (${data.length} éléments)`);
  }

  /**
   * Récupère des données d'un compartiment
   */
  getData(compartmentId: string, entityType: string): any[] {
    const compartment = this.compartments.get(compartmentId);
    if (!compartment) {
      console.warn(`⚠️ Compartiment non trouvé: ${compartmentId}`);
      return [];
    }

    return compartment.data.get(entityType) || [];
  }

  /**
   * Nettoie un compartiment spécifique
   */
  cleanupCompartment(compartmentId: string): void {
    const compartment = this.compartments.get(compartmentId);
    if (!compartment) {
      return;
    }

    console.log(`🧹 Nettoyage du compartiment: ${compartmentId}`);
    
    // Nettoyer le timer
    if (compartment.cleanupTimer) {
      clearTimeout(compartment.cleanupTimer);
    }

    // Compter les données supprimées pour le rapport
    let totalItems = 0;
    compartment.data.forEach(items => totalItems += items.length);

    // Nettoyer les données du localStorage si nécessaire
    this.cleanupLocalStorage(compartmentId);

    // Supprimer le compartiment
    this.compartments.delete(compartmentId);
    
    console.log(`✅ Compartiment ${compartmentId} nettoyé (${totalItems} éléments supprimés)`);
    
    // Notification à l'utilisateur si c'est une session active
    if (totalItems > 0) {
      toast.info(`🧹 Données temporaires nettoyées automatiquement (${totalItems} éléments)`);
    }
  }

  /**
   * Nettoie les données du localStorage associées à un compartiment
   */
  private cleanupLocalStorage(compartmentId: string): void {
    try {
      // Nettoyer les clés localStorage qui contiennent l'ID du compartiment
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes(compartmentId) || key.includes('temp-') || key.includes('demo-'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Clé localStorage supprimée: ${key}`);
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage localStorage:', error);
    }
  }

  /**
   * Nettoie tous les compartiments expirés
   */
  cleanupExpiredCompartments(): void {
    const now = Date.now();
    const expiredCompartments: string[] = [];

    this.compartments.forEach((compartment, id) => {
      const ageInMinutes = (now - compartment.config.timestamp) / (1000 * 60);
      const maxAge = compartment.config.cleanupInterval || this.defaultCleanupInterval;
      
      if (ageInMinutes >= maxAge) {
        expiredCompartments.push(id);
      }
    });

    expiredCompartments.forEach(id => {
      this.cleanupCompartment(id);
    });

    if (expiredCompartments.length > 0) {
      console.log(`🧹 ${expiredCompartments.length} compartiments expirés nettoyés`);
    }
  }

  /**
   * Obtient les statistiques des compartiments
   */
  getStats(): {
    totalCompartments: number;
    totalDataItems: number;
    oldestCompartment?: string;
    newestCompartment?: string;
  } {
    let totalDataItems = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    let oldestCompartment = '';
    let newestCompartment = '';

    this.compartments.forEach((compartment, id) => {
      compartment.data.forEach(items => totalDataItems += items.length);
      
      if (compartment.config.timestamp < oldestTimestamp) {
        oldestTimestamp = compartment.config.timestamp;
        oldestCompartment = id;
      }
      
      if (compartment.config.timestamp > newestTimestamp) {
        newestTimestamp = compartment.config.timestamp;
        newestCompartment = id;
      }
    });

    return {
      totalCompartments: this.compartments.size,
      totalDataItems,
      oldestCompartment: oldestCompartment || undefined,
      newestCompartment: newestCompartment || undefined
    };
  }

  /**
   * Démarre le nettoyage périodique automatique
   */
  startPeriodicCleanup(intervalMinutes: number = 5): void {
    setInterval(() => {
      this.cleanupExpiredCompartments();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`🔄 Nettoyage périodique démarré (toutes les ${intervalMinutes} minutes)`);
  }
}

// Export de l'instance singleton
export const dataCompartmentManager = DataCompartmentManager.getInstance();