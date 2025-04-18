import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseCabinetService } from "../supabase-api/cabinet-service";

// Simulated data for cabinets
const cabinets: Cabinet[] = [
  {
    id: 1,
    name: "Cabinet Principal",
    address: "123 Rue Principale, Ville",
    phone: "0123456789",
    email: "cabinet@example.com",
    logoUrl: "https://example.com/logo.png",
    imageUrl: "https://example.com/image.png",
    osteopathId: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "Second Cabinet",
    address: "456 Autre Rue, Autre Ville",
    phone: "0987654321",
    email: "second.cabinet@example.com",
    logoUrl: "https://example.com/second-logo.png",
    imageUrl: "https://example.com/second-image.png",
    osteopathId: 2,
    createdAt: "2023-02-15T00:00:00.000Z",
    updatedAt: "2023-02-15T00:00:00.000Z"
  }
];

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinets();
      } catch (error) {
        console.error('Error getCabinets:', error);
        throw error;
      }
    }
    
    await delay(300);
    return cabinets;
  },
  
  async getCabinetById(id: number): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetById(id);
      } catch (error) {
        console.error('Error getCabinetById:', error);
        throw error;
      }
    }
    
    await delay(300);
    const cabinet = cabinets.find(cabinet => cabinet.id === id);
    if (!cabinet) {
      throw new Error(`Cabinet with id ${id} not found`);
    }
    return cabinet;
  },

  // Renamed from getCabinetByOsteopathId to getCabinetsByOsteopathId for consistency
  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetsByOsteopathId(osteopathId);
      } catch (error) {
        console.error('Error getCabinetsByOsteopathId:', error);
        throw error;
      }
    }
    
    await delay(300);
    return cabinets.filter(cabinet => cabinet.osteopathId === osteopathId);
  },
  
  // Adding the missing getCabinetsByUserId method
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.getCabinetsByUserId(userId);
      } catch (error) {
        console.error('Error getCabinetsByUserId:', error);
        throw error;
      }
    }
    
    await delay(300);
    // This is a mock implementation for local testing
    return cabinets;
  },
  
  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.createCabinet(cabinet);
      } catch (error) {
        console.error('Error createCabinet:', error);
        throw error;
      }
    }
    
    await delay(300);
    const newCabinet: Cabinet = {
      id: cabinets.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...cabinet
    };
    cabinets.push(newCabinet);
    return newCabinet;
  },
  
  async updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.updateCabinet(id, cabinet);
      } catch (error) {
        console.error('Error updateCabinet:', error);
        throw error;
      }
    }
    
    await delay(300);
    const index = cabinets.findIndex(cabinet => cabinet.id === id);
    if (index === -1) {
      throw new Error(`Cabinet with id ${id} not found`);
    }
    cabinets[index] = { ...cabinets[index], ...cabinet, updatedAt: new Date().toISOString() };
    return cabinets[index];
  },
  
  async deleteCabinet(id: number): Promise<void> {
    if (USE_SUPABASE) {
      try {
        return await supabaseCabinetService.deleteCabinet(id);
      } catch (error) {
        console.error('Error deleteCabinet:', error);
        throw error;
      }
    }
    
    await delay(300);
    const index = cabinets.findIndex(cabinet => cabinet.id === id);
    if (index === -1) {
      throw new Error(`Cabinet with id ${id} not found`);
    }
    cabinets.splice(index, 1);
  }
};
