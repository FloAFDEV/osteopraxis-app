
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet-service";

// Données simulées pour les cabinets
const cabinets: Cabinet[] = [
  {
    id: 1,
    name: "Cabinet d'Ostéopathie Zen",
    address: "18 Rue Lafayette, Toulouse",
    city: "Toulouse",
    postalCode: "31000",
    phone: "05 61 23 45 67",
    email: "contact@osteo-zen.fr",
    siret: "12345678900010",
    iban: null,
    bic: null,
    country: "France",
    imageUrl: null,
    logoUrl: null,
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

  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetsByUserId(userId);
      } catch (error) {
        console.error("Erreur Supabase getCabinetsByUserId:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...cabinets]; // Simulation: return all cabinets for demo
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
        const result = await supabaseCabinetService.updateCabinet(id, cabinetData);
        // Ne pas afficher de toast ici pour éviter les doublons
        // Le toast sera affiché dans le composant appelant
        return result;
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
        await supabaseCabinetService.deleteCabinet(id);
        return true;
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
