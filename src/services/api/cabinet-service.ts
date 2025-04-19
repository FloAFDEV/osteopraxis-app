import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      const { data, error } = await supabase
        .from('Cabinet')
        .select('*');
        
      if (error) throw new Error(error.message);
      return data as Cabinet[];
    } catch (error) {
      console.error("Error fetching cabinets:", error);
      throw error;
    }
  },
  
  async getCabinetById(id: number): Promise<Cabinet | null> {
    try {
      const { data, error } = await supabase
        .from('Cabinet')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching cabinet:", error);
        throw error;
      }
      
      return data as Cabinet;
    } catch (error) {
      console.error("Error fetching cabinet by ID:", error);
      return null;
    }
  },
  
  async createCabinet(cabinetData: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('Cabinet')
        .insert({
          name: cabinetData.name,
          address: cabinetData.address,
          phone: cabinetData.phone,
          email: cabinetData.email,
          logoUrl: cabinetData.logoUrl,
          imageUrl: cabinetData.imageUrl,
          professionalProfileId: cabinetData.professionalProfileId,
          osteopathId: cabinetData.professionalProfileId, // use professionalProfileId as osteopathId
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
    
      if (error) {
        throw error;
      }
    
      return data as Cabinet;
    } catch (error) {
      console.error("Error creating cabinet:", error);
      throw error;
    }
  },
  
  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet> {
    try {
      const { data, error } = await supabase
        .from('Cabinet')
        .update(cabinetData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data as Cabinet;
    } catch (error) {
      console.error("Error updating cabinet:", error);
      throw error;
    }
  },
  
  async deleteCabinet(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Cabinet')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error("Error deleting cabinet:", error);
      return false;
    }
  }
};
