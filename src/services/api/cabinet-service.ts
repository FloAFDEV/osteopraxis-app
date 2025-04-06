
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet-service";

// Données simulées pour les cabinets
const cabinets: Cabinet[] = [
  {
    id: 1,
    name: "Cabinet d'Ostéopathie Zen",
    address: "18 Rue Lafayette, Toulouse",
    phone: "05 61 23 45 67",
    osteopathId: 1,
    createdAt: "2024-12-20 22:29:30",
    updatedAt: "2024-12-20 22:29:30"
  }
];

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinets();
      } catch (error) {
        console.error("Erreur Supabase getCabinets:", error);
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...cabinets];
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetById(id);
      } catch (error) {
        console.error("Erreur Supabase getCabinetById:", error);
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return cabinets.find(cabinet => cabinet.id === id);
  },

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.updateCabinet(id, cabinetData);
      } catch (error) {
        console.error("Erreur Supabase updateCabinet:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = cabinets.findIndex(c => c.id === id);
    if (index !== -1) {
      cabinets[index] = { 
        ...cabinets[index], 
        ...cabinetData,
        updatedAt: new Date().toISOString() 
      };
      return cabinets[index];
    }
    return undefined;
  }
};
