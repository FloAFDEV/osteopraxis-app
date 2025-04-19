import { Osteopath } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const osteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .select('*');
        
      if (error) throw new Error(error.message);
      return data as Osteopath[];
    } catch (error) {
      console.error("Error fetching osteopaths:", error);
      throw error;
    }
  },

  async getOsteopathById(id: number): Promise<Osteopath | null> {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
      // If error is "No rows found", return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Transform the database object to match the Osteopath type
    const osteopath: Osteopath = {
      id: data.id,
      userId: data.userId,
      name: data.name,
      title: data.professional_title || "Ostéopathe D.O.",
      adeli_number: data.adeli_number,
      siret: data.siret,
      ape_code: data.ape_code,
      profession_type: "osteopathe", // Default value 
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };

    return osteopath;
  } catch (error) {
    console.error("Error fetching osteopath by ID:", error);
    throw error;
  }
},

  async createOsteopath(osteopath: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('Osteopath')
        .insert({
          ...osteopath,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Transform the database object to match the Osteopath type
      const newOsteopath: Osteopath = {
        id: data.id,
        userId: data.userId,
        name: data.name,
        title: data.title || "Ostéopathe D.O.",
        adeli_number: data.adeli_number,
        siret: data.siret,
        ape_code: data.ape_code,
        profession_type: "osteopathe", // Default value 
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      return newOsteopath;
    } catch (error) {
      console.error("Error creating osteopath:", error);
      throw error;
    }
  },

  async updateOsteopath(id: number, updates: Partial<Osteopath>): Promise<Osteopath> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('Osteopath')
        .update({
          ...updates,
          updatedAt: now,
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Transform the database object to match the Osteopath type
      const updatedOsteopath: Osteopath = {
        id: data.id,
        userId: data.userId,
        name: data.name,
        title: data.title || "Ostéopathe D.O.",
        adeli_number: data.adeli_number,
        siret: data.siret,
        ape_code: data.ape_code,
        profession_type: "osteopathe", // Default value 
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      return updatedOsteopath;
    } catch (error) {
      console.error("Error updating osteopath:", error);
      throw error;
    }
  },

  async deleteOsteopath(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Osteopath')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error("Error deleting osteopath:", error);
      return false;
    }
  }
};
