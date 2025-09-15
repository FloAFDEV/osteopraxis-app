/**
 * 🏢 Service Cabinet - Utilise StorageRouter pour routage automatique
 * 
 * Données Cabinet = Non-HDS → Supabase cloud en mode connecté
 * Mode démo → demo-local-storage (sessionStorage éphémère)
 */

import { Cabinet } from "@/types";
import { storageRouter } from '@/services/storage/storage-router';

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    return adapter.getAll();
  },

  async getCabinetById(id: number): Promise<Cabinet | null> {
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    return adapter.getById(id);
  },

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    const result = await adapter.create(cabinet);
    
    // Invalider le cache pour que les nouveaux données soient visibles immédiatement
    const { cabinetCache } = await import('@/services/cache/cabinet-cache');
    cabinetCache.invalidate();
    
    return result;
  },

  async updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet> {
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    const result = await adapter.update(id, cabinet);
    
    // Invalider le cache pour que les modifications soient visibles immédiatement
    const { cabinetCache } = await import('@/services/cache/cabinet-cache');
    cabinetCache.invalidate();
    
    return result;
  },

  async deleteCabinet(id: number): Promise<boolean> {
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    return adapter.delete(id);
  },

  // Méthodes spécifiques (compatibilité existante)
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    // Utiliser le StorageRouter pour récupérer tous les cabinets
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    const allCabinets = await adapter.getAll();
    
    // En mode connecté, filtrer par utilisateur si nécessaire
    // En mode démo, retourner tous les cabinets démo
    return allCabinets;
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    const adapter = await storageRouter.route<Cabinet>('cabinets');
    const allCabinets = await adapter.getAll();
    
    // Filtrer par ostéopathe ou par associations cabinet-ostéopathe
    return allCabinets.filter(cabinet => 
      cabinet.osteopathId === osteopathId
    );
  },

  // Méthodes pour associations ostéopathe-cabinet (compatibilité)
  async associateOsteopathToCabinet(osteopathId: number, cabinetId: number): Promise<void> {
    // Implémentation temporaire
    console.log(`Association ostéopathe ${osteopathId} avec cabinet ${cabinetId}`);
  },

  async dissociateOsteopathFromCabinet(osteopathId: number, cabinetId: number): Promise<void> {
    // Implémentation temporaire
    console.log(`Dissociation ostéopathe ${osteopathId} du cabinet ${cabinetId}`);
  },

  async getOsteopathCabinets(osteopathId: number): Promise<number[]> {
    // Implémentation temporaire
    console.log(`Récupération cabinets pour ostéopathe ${osteopathId}`);
    return [];
  }
};
