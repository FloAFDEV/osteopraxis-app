/**
 * Service de cache global pour les cabinets
 * Centralise tous les appels API pour éviter les duplicata
 */

import { Cabinet } from '@/types';
import { api } from '@/services/api';

interface CacheEntry {
  data: Cabinet[];
  timestamp: number;
  promise?: Promise<Cabinet[]>;
  promiseResolvers?: Set<(value: Cabinet[]) => void>;
}

class CabinetCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private demoContext: any = null;
  private activeFetches = new Map<string, Promise<Cabinet[]>>();

  setDemoContext(context: any) {
    this.demoContext = context;
  }

  /**
   * Récupérer tous les cabinets avec cache intelligent
   */
  async getCabinets(): Promise<Cabinet[]> {
    const cacheKey = 'all_cabinets';
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Si on a des données fraîches, les retourner immédiatement
    if (cached?.data && (now - cached.timestamp) < this.TTL) {
      console.log('⚡ Cabinets depuis le cache');
      return cached.data;
    }

    // Si on a déjà une requête en cours, l'attendre
    const activePromise = this.activeFetches.get(cacheKey);
    if (activePromise) {
      console.log('🔄 Attente de la requête cabinets en cours...');
      return activePromise;
    }

    // Créer une nouvelle requête
    console.log('🌐 Récupération cabinets depuis l\'API...');
    const promise = this.fetchCabinetsFromAPI();
    
    // Stocker la promesse pour éviter les appels multiples
    this.activeFetches.set(cacheKey, promise);

    try {
      const data = await promise;
      
      // Mettre à jour le cache avec les nouvelles données
      this.cache.set(cacheKey, {
        data,
        timestamp: now
      });

      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error);
      throw error;
    } finally {
      // Nettoyer la promesse active
      this.activeFetches.delete(cacheKey);
    }
  }

  /**
   * Récupérer un cabinet par ID avec cache
   */
  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    const cacheKey = `cabinet_${id}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Vérifier le cache individuel
    if (cached?.data && (now - cached.timestamp) < this.TTL) {
      console.log(`⚡ Cabinet ${id} depuis le cache`);
      return cached.data[0];
    }

    // Essayer de trouver dans le cache global
    const allCabinets = this.cache.get('all_cabinets');
    if (allCabinets?.data) {
      const cabinet = allCabinets.data.find(c => c.id === id);
      if (cabinet) {
        // Mettre en cache individuellement
        this.cache.set(cacheKey, {
          data: [cabinet],
          timestamp: now
        });
        console.log(`⚡ Cabinet ${id} trouvé dans le cache global`);
        return cabinet;
      }
    }

    // Sinon, faire l'appel API
    console.log(`🌐 Récupération cabinet ${id} depuis l'API...`);
    try {
      const cabinet = await api.getCabinetById(id);
      if (cabinet) {
        this.cache.set(cacheKey, {
          data: [cabinet],
          timestamp: now
        });
      }
      return cabinet;
    } catch (error) {
      console.error(`Erreur récupération cabinet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Invalider le cache
   */
  invalidate(cabinetId?: number): void {
    if (cabinetId) {
      this.cache.delete(`cabinet_${cabinetId}`);
      console.log(`🗑️ Cache cabinet ${cabinetId} invalidé`);
    } else {
      this.cache.clear();
      this.activeFetches.clear();
      console.log('🗑️ Cache cabinets totalement invalidé');
    }
  }

  /**
   * Récupération API interne
   */
  private async fetchCabinetsFromAPI(): Promise<Cabinet[]> {
    // Gérer le mode démo
    if (this.demoContext?.isDemoMode) {
      console.log("CabinetCache: Using demo data");
      await this.delay(200);
      return [...this.demoContext.demoData.cabinets];
    }
    
    return await api.getCabinets();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Pré-charger les cabinets
   */
  async preload(): Promise<void> {
    try {
      await this.getCabinets();
      console.log('✅ Cabinets pré-chargés en cache');
    } catch (error) {
      console.warn('⚠️ Échec pré-chargement cabinets:', error);
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    const stats = {
      totalEntries: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hasData: !!entry.data?.length,
        age: Date.now() - entry.timestamp,
        isExpired: (Date.now() - entry.timestamp) > this.TTL
      }))
    };
    return stats;
  }
}

// Instance singleton
export const cabinetCache = new CabinetCacheService();