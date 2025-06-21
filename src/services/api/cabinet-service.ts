
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet";
import { osteopathCabinetService } from "../supabase-api/osteopath-cabinet-service";

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinets();
      } catch (error) {
        console.error("Erreur Supabase getCabinets:", error);
      }
    }
    
    await delay(300);
    return [];
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetById(id);
      } catch (error) {
        console.error("Erreur Supabase getCabinetById:", error);
      }
    }
    
    await delay(200);
    return undefined;
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

  // Méthodes pour la gestion des associations ostéopathe-cabinet
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
      // Récupérer les IDs des cabinets associés
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
};
