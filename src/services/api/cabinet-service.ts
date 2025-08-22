
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet";
import { osteopathCabinetService } from "../supabase-api/osteopath-cabinet-service";
import { cabinetCache } from "../cache/cabinet-cache";

// Hook pour accéder au contexte démo depuis les services
let demoContext: any = null;
export const setDemoContext = (context: any) => {
  demoContext = context;
  // Aussi passer le contexte au cache
  cabinetCache.setDemoContext(context);
};

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    // Utiliser le cache global en premier
    return await cabinetCache.getCabinets();
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    // Utiliser le cache global en premier
    return await cabinetCache.getCabinetById(id);
  },

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        const newCabinet = await supabaseCabinetService.createCabinet(cabinet);
        
        // Automatiquement associer l'ostéopathe au nouveau cabinet
        if (cabinet.osteopathId) {
          await osteopathCabinetService.associateOsteopathToCabinet(
            cabinet.osteopathId, 
            newCabinet.id
          );
        }
        
        // Invalider le cache après création
        cabinetCache.invalidate();
        
        return newCabinet;
      } catch (error) {
        console.error("Erreur Supabase createCabinet:", error);
        throw error;
      }
    }
    
    await delay(400);
    throw new Error("Service non configuré");
  },

  async updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        // Invalider le cache après mise à jour
        cabinetCache.invalidate(id);
        
        return await supabaseCabinetService.updateCabinet(id, cabinet);
      } catch (error) {
        console.error("Erreur Supabase updateCabinet:", error);
        throw error;
      }
    }
    
    await delay(300);
    throw new Error("Service non configuré");
  },

  async deleteCabinet(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        // Invalider le cache après suppression
        cabinetCache.invalidate(id);
        
        await supabaseCabinetService.deleteCabinet(id);
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteCabinet:", error);
        throw error;
      }
    }
    
    await delay(300);
    return false;
  },

  // Méthodes pour la gestion des associations ostéopathe-cabinet (sécurisées)
  async associateOsteopathToCabinet(osteopathId: number, cabinetId: number): Promise<void> {
    return await osteopathCabinetService.associateOsteopathToCabinet(osteopathId, cabinetId);
  },

  async dissociateOsteopathFromCabinet(osteopathId: number, cabinetId: number): Promise<void> {
    return await osteopathCabinetService.dissociateOsteopathFromCabinet(osteopathId, cabinetId);
  },

  async getOsteopathCabinets(osteopathId: number): Promise<number[]> {
    return await osteopathCabinetService.getOsteopathCabinets(osteopathId);
  },

  // Méthodes héritées pour compatibilité
  getCabinetsByUserId: supabaseCabinetService.getCabinetsByUserId,
  getCabinetsByOsteopathId: async (osteopathId: number): Promise<Cabinet[]> => {
    try {
      // Récupérer les IDs des cabinets associés via le système sécurisé
      const cabinetIds = await osteopathCabinetService.getOsteopathCabinets(osteopathId);
      
      // Récupérer les détails de chaque cabinet
      const cabinets = await Promise.all(
        cabinetIds.map(id => supabaseCabinetService.getCabinetById(id))
      );
      
      return cabinets.filter(Boolean) as Cabinet[];
    } catch (error) {
      console.error("Erreur lors de la récupération des cabinets de l'ostéopathe:", error);
      return [];
    }
  },
  
  // Méthode pour injecter le contexte démo
  setDemoContext,
};
