/**
 * Service de cache simple et performant pour les cabinets
 * Utilise le StorageRouter pour respecter tous les modes (démo, local HDS, iframe)
 */

import { Cabinet } from '@/types';
import { storageRouter } from '../storage/storage-router';

interface CacheEntry {
  data: Cabinet[];
  timestamp: number;
}

class CabinetCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private activeFetches = new Map<string, Promise<Cabinet[]>>();
  // setDemoContext supprimé - Architecture hybride avec StorageRouter

  /**
   * Récupérer tous les cabinets avec cache intelligent
   */
  async getCabinets(): Promise<Cabinet[]> {
    const cacheKey = 'all_cabinets';
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Si on a des données fraîches, les retourner immédiatement
    if (cached?.data && (now - cached.timestamp) < this.TTL) {
      return cached.data;
    }

    // Si on a déjà une requête en cours, l'attendre
    const activePromise = this.activeFetches.get(cacheKey);
    if (activePromise) {
      return activePromise;
    }

    // Créer une nouvelle requête via le StorageRouter pour respecter tous les modes
    const promise = this.fetchFromStorageRouter();
    this.activeFetches.set(cacheKey, promise);

    try {
      const data = await promise;
      
      // Mettre à jour le cache
      this.cache.set(cacheKey, {
        data,
        timestamp: now
      });

      return data;
    } catch (error) {
      console.error('Erreur chargement cabinets:', error);
      throw error;
    } finally {
      this.activeFetches.delete(cacheKey);
    }
  }

  /**
   * Récupérer un cabinet par ID
   */
  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    // Essayer d'abord dans le cache global
    const allCabinets = this.cache.get('all_cabinets');
    if (allCabinets?.data) {
      const cabinet = allCabinets.data.find(c => c.id === id);
      if (cabinet) {
        return cabinet;
      }
    }

    // Sinon charger via le StorageRouter
    try {
      const cabinetAdapter = await storageRouter.route<Cabinet>('cabinets');
      return await cabinetAdapter.getById(id);
    } catch (error) {
      console.error(`Erreur récupération cabinet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Invalider le cache
   */
  invalidate(): void {
    this.cache.clear();
    this.activeFetches.clear();
  }

  /**
   * Invalider et recharger immédiatement
   */
  async invalidateAndRefetch(): Promise<Cabinet[]> {
    this.invalidate();
    return this.getCabinets();
  }

  /**
   * Récupération via le StorageRouter (respecte tous les modes)
   */
  private async fetchFromStorageRouter(): Promise<Cabinet[]> {
    console.log('🔧 [CabinetCache] === DÉBUT fetchFromStorageRouter ===');
    try {
      console.log('🔧 [CabinetCache] Récupération via StorageRouter...');
      const cabinetAdapter = await storageRouter.route<Cabinet>('cabinets');
      const result = await cabinetAdapter.getAll();
      
      console.log(`✅ [CabinetCache] StorageRouter a retourné ${result.length} cabinet(s)`);
      return result;
    } catch (error) {
      console.error('❌ [CabinetCache] Erreur récupération cabinets via StorageRouter:', error);
      
      // Fallback de dernière chance
      const fallbackCabinet: Cabinet = {
        id: 999996,
        name: 'Cabinet Cache Fallback',
        address: 'Erreur de cache - Données temporaires',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
        email: '',
        siret: '',
        iban: null,
        bic: null,
        osteopathId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🆘 [CabinetCache] Fallback de dernière chance:', fallbackCabinet);
      return [fallbackCabinet];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instance singleton
export const cabinetCache = new CabinetCacheService();