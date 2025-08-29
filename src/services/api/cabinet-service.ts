
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet";
import { osteopathCabinetService } from "../supabase-api/osteopath-cabinet-service";
import { cabinetCache } from "../cache/cabinet-cache";

// Hook pour accéder au contexte démo depuis les services
export const setDemoContext = (context: any) => {
  cabinetCache.setDemoContext(context);
};

export const cabinetService = {
  // Utiliser le cache directement
  getCabinets: () => cabinetCache.getCabinets(),
  getCabinetById: (id: number) => cabinetCache.getCabinetById(id),

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    // Vérifier le mode démo
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      // Mode démo : stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      return demoLocalStorage.addCabinet(cabinet);
    }
    
    if (USE_SUPABASE) {
      try {
        const newCabinet = await supabaseCabinetService.createCabinet(cabinet);
        
        // Associer l'ostéopathe au nouveau cabinet
        if (cabinet.osteopathId) {
          await osteopathCabinetService.associateOsteopathToCabinet(
            cabinet.osteopathId, 
            newCabinet.id
          );
        }
        
        // Invalider le cache
        cabinetCache.invalidate();
        
        return newCabinet;
      } catch (error) {
        console.error("Erreur createCabinet:", error);
        throw error;
      }
    }
    
    await delay(400);
    throw new Error("Service non configuré");
  },

  async updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        const result = await supabaseCabinetService.updateCabinet(id, cabinet);
        cabinetCache.invalidate();
        return result;
      } catch (error) {
        console.error("Erreur updateCabinet:", error);
        throw error;
      }
    }
    
    await delay(300);
    throw new Error("Service non configuré");
  },

  async deleteCabinet(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        await supabaseCabinetService.deleteCabinet(id);
        cabinetCache.invalidate();
        return true;
      } catch (error) {
        console.error("Erreur deleteCabinet:", error);
        throw error;
      }
    }
    
    await delay(300);
    return false;
  },

  // Méthodes pour les associations ostéopathe-cabinet
  associateOsteopathToCabinet: osteopathCabinetService.associateOsteopathToCabinet,
  dissociateOsteopathFromCabinet: osteopathCabinetService.dissociateOsteopathFromCabinet,
  getOsteopathCabinets: osteopathCabinetService.getOsteopathCabinets,

  // Méthodes héritées pour compatibilité
  getCabinetsByUserId: supabaseCabinetService.getCabinetsByUserId,
  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    try {
      const cabinetIds = await osteopathCabinetService.getOsteopathCabinets(osteopathId);
      const cabinets = await Promise.all(
        cabinetIds.map(id => supabaseCabinetService.getCabinetById(id))
      );
      return cabinets.filter(Boolean) as Cabinet[];
    } catch (error) {
      console.error("Erreur getCabinetsByOsteopathId:", error);
      return [];
    }
  },
  
  setDemoContext,
};
