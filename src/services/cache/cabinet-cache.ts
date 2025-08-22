/**
 * Service de cache simple et performant pour les cabinets
 */

import { Cabinet } from '@/types';
import { supabaseCabinetService } from '../supabase-api/cabinet';

interface CacheEntry {
  data: Cabinet[];
  timestamp: number;
}

class CabinetCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private activeFetches = new Map<string, Promise<Cabinet[]>>();
  private demoContext: any = null;

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
      return cached.data;
    }

    // Si on a déjà une requête en cours, l'attendre
    const activePromise = this.activeFetches.get(cacheKey);
    if (activePromise) {
      return activePromise;
    }

    // Créer une nouvelle requête - DIRECTEMENT vers Supabase pour éviter la boucle
    const promise = this.fetchFromSupabase();
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

    // Sinon charger directement depuis Supabase
    try {
      return await supabaseCabinetService.getCabinetById(id);
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
   * Appel direct à Supabase (pas de boucle)
   */
  private async fetchFromSupabase(): Promise<Cabinet[]> {
    // Mode démo
    if (this.demoContext?.isDemoMode) {
      await this.delay(200);
      return [...this.demoContext.demoData.cabinets];
    }
    
    // Appel direct à Supabase
    return await supabaseCabinetService.getCabinets();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instance singleton
export const cabinetCache = new CabinetCacheService();