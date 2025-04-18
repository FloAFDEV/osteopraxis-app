
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet-service";

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      return await supabaseCabinetService.getCabinets();
    } catch (error) {
      console.error("Erreur Supabase getCabinets:", error);
      throw error;
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | null> {
    try {
      return await supabaseCabinetService.getCabinetById(id);
    } catch (error) {
      console.error("Erreur Supabase getCabinetById:", error);
      throw error;
    }
  },
  
  async getCabinetsByProfessionalProfileId(professionalProfileId: number): Promise<Cabinet[]> {
    try {
      return await supabaseCabinetService.getCabinetsByProfessionalProfileId(professionalProfileId);
    } catch (error) {
      console.error("Erreur Supabase getCabinetsByProfessionalProfileId:", error);
      throw error;
    }
  },
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    try {
      return await supabaseCabinetService.getCabinetsByUserId(userId);
    } catch (error) {
      console.error("Erreur Supabase getCabinetsByUserId:", error);
      throw error;
    }
  },
  
  // Pour compatibilité avec le code existant
  async getCabinetsByOsteopathId(professionalProfileId: number): Promise<Cabinet[]> {
    return this.getCabinetsByProfessionalProfileId(professionalProfileId);
  },
  
  async createCabinet(data: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      return await supabaseCabinetService.createCabinet(data);
    } catch (error) {
      console.error("Erreur Supabase createCabinet:", error);
      throw error;
    }
  },
  
  async updateCabinet(id: number, data: Partial<Omit<Cabinet, 'id' | 'createdAt'>>): Promise<Cabinet | null> {
    try {
      return await supabaseCabinetService.updateCabinet(id, data);
    } catch (error) {
      console.error("Erreur Supabase updateCabinet:", error);
      throw error;
    }
  },
  
  async deleteCabinet(id: number): Promise<void> {
    try {
      return await supabaseCabinetService.deleteCabinet(id);
    } catch (error) {
      console.error("Erreur Supabase deleteCabinet:", error);
      throw error;
    }
  },
};
