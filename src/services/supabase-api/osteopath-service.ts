// Fix for osteopath-service.ts to ensure proper type compatibility
import { supabase } from "./utils";
import { Osteopath } from "@/types";

// Helper function to adapt Osteopath data from Supabase
const adaptOsteopathFromSupabase = (data: any): Osteopath => ({
  id: data.id,
  name: data.name,
  adeli_number: data.adeli_number,
  siret: data.siret,
  ape_code: data.ape_code,
  professional_title: data.professional_title,
  userId: data.userId,
  createdAt: data.createdAt || data.created_at,
  updatedAt: data.updatedAt || data.updated_at
});

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .select('*');

      if (error) {
        console.error('Error fetching osteopaths:', error);
        throw error;
      }

      return (data || []).map(adaptOsteopathFromSupabase);
    } catch (error) {
      console.error('Error in getOsteopaths:', error);
      throw error;
    }
  },

  async getOsteopathById(id: number): Promise<Osteopath | null> {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching osteopath by id:', error);
        throw error;
      }

      return data ? adaptOsteopathFromSupabase(data) : null;
    } catch (error) {
      console.error('Error in getOsteopathById:', error);
      throw error;
    }
  },

  async getOsteopathByUserId(userId: string): Promise<Osteopath | null> {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .select('*')
        .eq('userId', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching osteopath by userId:', error);
        throw error;
      }

      return data ? adaptOsteopathFromSupabase(data) : null;
    } catch (error) {
      console.error('Error in getOsteopathByUserId:', error);
      throw error;
    }
  },

  async createOsteopath(osteopath: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    try {
      const now = new Date().toISOString();
      
      const osteopathData = {
        name: osteopath.name,
        adeli_number: osteopath.adeli_number || null,
        siret: osteopath.siret || null,
        ape_code: osteopath.ape_code || "8690F",
        professional_title: osteopath.professional_title || "Ostéopathe D.O.",
        userId: osteopath.userId,
        createdAt: now,
        updatedAt: now
      };
      
      const { data, error } = await supabase
        .from('Osteopath')
        .insert(osteopathData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating osteopath:', error);
        throw error;
      }
      
      return adaptOsteopathFromSupabase(data);
    } catch (error) {
      console.error('Error in createOsteopath:', error);
      throw error;
    }
  },

  async updateOsteopath(id: number, osteopath: Partial<Osteopath>): Promise<Osteopath | undefined> {
    try {
      const { data, error } = await supabase
        .from('Osteopath')
        .update(osteopath)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating osteopath:', error);
        throw error;
      }

      return data ? adaptOsteopathFromSupabase(data) : undefined;
    } catch (error) {
      console.error('Error in updateOsteopath:', error);
      throw error;
    }
  },

  async deleteOsteopath(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Osteopath')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting osteopath:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteOsteopath:', error);
      throw error;
    }
  }
};

export default supabaseOsteopathService;
