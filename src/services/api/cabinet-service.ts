
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabase } from "@/integrations/supabase/client";

// Sample data for development
const cabinets: Cabinet[] = [];

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Cabinet')
          .select('*');
          
        if (error) throw error;
        return data as Cabinet[];
      } catch (error) {
        console.error("Error fetching cabinets:", error);
        throw error;
      }
    }
    
    await delay(300);
    return [...cabinets];
  },

  async getCabinetById(id: number): Promise<Cabinet | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Cabinet')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        return data as Cabinet;
      } catch (error) {
        console.error("Error fetching cabinet by ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    return cabinets.find(cabinet => cabinet.id === id) || null;
  },

  async getCabinetsByProfessionalProfileId(profileId: number): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Cabinet')
          .select('*')
          .eq('professionalProfileId', profileId);
          
        if (error) throw error;
        return data as Cabinet[];
      } catch (error) {
        console.error("Error fetching cabinets by profile ID:", error);
        throw error;
      }
    }
    
    await delay(300);
    return cabinets.filter(cabinet => cabinet.professionalProfileId === profileId);
  },

  async createCabinet(cabinetData: Partial<Cabinet>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        const now = new Date().toISOString();
        
        // Only include fields that match the Supabase schema
        const cabinetPayload = {
          name: cabinetData.name || '',
          address: cabinetData.address || '',
          phone: cabinetData.phone,
          email: cabinetData.email,
          professionalProfileId: cabinetData.professionalProfileId,
          osteopathId: cabinetData.osteopathId || 0,
          logoUrl: cabinetData.logoUrl,
          imageUrl: cabinetData.imageUrl,
          updatedAt: now
        };
        
        const { data, error } = await supabase
          .from('Cabinet')
          .insert(cabinetPayload)
          .select()
          .single();
          
        if (error) throw error;
        return data as Cabinet;
      } catch (error) {
        console.error("Error creating cabinet:", error);
        throw error;
      }
    }
    
    await delay(400);
    const now = new Date().toISOString();
    const newCabinet = {
      ...cabinetData,
      id: cabinets.length + 1,
      createdAt: now,
      updatedAt: now,
    } as Cabinet;
    cabinets.push(newCabinet);
    return newCabinet;
  },

  async updateCabinet(id: number, updates: Partial<Cabinet>): Promise<Cabinet> {
    if (USE_SUPABASE) {
      try {
        // Only include fields that match the Supabase schema
        const cabinetPayload = {
          name: updates.name,
          address: updates.address,
          phone: updates.phone,
          email: updates.email,
          professionalProfileId: updates.professionalProfileId,
          osteopathId: updates.osteopathId,
          logoUrl: updates.logoUrl,
          imageUrl: updates.imageUrl,
          updatedAt: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('Cabinet')
          .update(cabinetPayload)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data as Cabinet;
      } catch (error) {
        console.error("Error updating cabinet:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = cabinets.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Cabinet with id ${id} not found`);
    
    cabinets[index] = {
      ...cabinets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return cabinets[index];
  },

  async deleteCabinet(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase
          .from('Cabinet')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error deleting cabinet:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = cabinets.findIndex(c => c.id === id);
    if (index !== -1) {
      cabinets.splice(index, 1);
      return true;
    }
    return false;
  }
};
