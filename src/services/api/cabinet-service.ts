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
    // 🚨 SÉCURITÉ: Vérifier le mode démo en amont
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      console.log('🎭 [CabinetService] Mode démo → Retour cabinet démo uniquement');
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      const demoCabinetId = localStorage.getItem('demo_cabinet_id');
      if (!demoCabinetId) {
        console.warn('⚠️ [CabinetService] Pas de cabinetId en mode démo');
        return [];
      }
      const demoCabinets = demoLocalStorage(demoCabinetId).getCabinets();
      console.log(`🎭 [CabinetService] Nombre de cabinets démo: ${demoCabinets.length}`, demoCabinets);
      return demoCabinets;
    }
    
    console.log('🔐 [CabinetService] Mode connecté → Utilisation StorageRouter');
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
    
    // En mode démo, retourner tous les cabinets
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      return allCabinets;
    }
    
    // En mode connecté, utiliser Supabase pour récupérer les associations réelles
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Récupérer les cabinets possédés directement par l'ostéopathe
      const { data: ownedCabinets, error: ownedError } = await supabase
        .from('Cabinet')
        .select('*')
        .eq('osteopathId', osteopathId);
      
      // Récupérer les cabinets via les associations (osteopath_cabinet)
      const { data: associations, error: assocError } = await supabase
        .from('osteopath_cabinet')
        .select('cabinet_id')
        .eq('osteopath_id', osteopathId);
      
      if (assocError) {
        console.warn('Erreur récupération associations cabinets:', assocError);
      }
      
      const associatedCabinetIds = associations?.map(a => a.cabinet_id) || [];
      
      // Récupérer les cabinets associés
      let associatedCabinets: Cabinet[] = [];
      if (associatedCabinetIds.length > 0) {
        const { data: cabinetsData, error: cabinetsError } = await supabase
          .from('Cabinet')
          .select('*')
          .in('id', associatedCabinetIds);
        
        if (!cabinetsError) {
          associatedCabinets = (cabinetsData as unknown as Cabinet[]) || [];
        }
      }
      
      // Combiner les cabinets possédés et associés
      const allOsteopathCabinets = [
        ...((ownedCabinets as unknown as Cabinet[]) || []),
        ...associatedCabinets
      ];
      
      // Dédupliquer par ID
      const uniqueCabinets = allOsteopathCabinets.filter((cabinet, index, self) => 
        index === self.findIndex(c => c.id === cabinet.id)
      );
      
      console.log(`✅ Récupéré ${uniqueCabinets.length} cabinets pour ostéopathe ${osteopathId}`);
      return uniqueCabinets;
      
    } catch (error) {
      console.error('Erreur récupération cabinets ostéopathe:', error);
      // Fallback vers filtrage simple en cas d'erreur
      return allCabinets.filter(cabinet => 
        cabinet.osteopathId === osteopathId
      );
    }
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
