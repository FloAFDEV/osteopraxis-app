
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
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...cabinets];
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetsByOsteopathId(osteopathId);
      } catch (error) {
        console.error("Erreur Supabase getCabinetsByOsteopathId:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return cabinets.filter(cabinet => cabinet.osteopathId === osteopathId);
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetById(id);
      } catch (error) {
        console.error("Erreur Supabase getCabinetById:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return cabinets.find(cabinet => cabinet.id === id);
  },

  async createCabinet(cabinetData: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.createCabinet(cabinetData);
      } catch (error) {
        console.error("Erreur Supabase createCabinet:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(400);
    const now = new Date().toISOString();
    const newCabinet = {
      ...cabinetData,
      id: cabinets.length + 1,
      createdAt: now,
      updatedAt: now
    } as Cabinet;
    cabinets.push(newCabinet);
    return newCabinet;
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
  },

  async deleteCabinet(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.deleteCabinet(id);
      } catch (error) {
        console.error("Erreur Supabase deleteCabinet:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = cabinets.findIndex(c => c.id === id);
    if (index !== -1) {
      cabinets.splice(index, 1);
      return true;
    }
    return false;
  }
};
