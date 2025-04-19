
import { Osteopath } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { delay, USE_SUPABASE } from "./config";

// Sample data for development
const osteopaths: Osteopath[] = [];

export const osteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Osteopath')
          .select('*');
          
        if (error) throw error;
        return data as Osteopath[];
      } catch (error) {
        console.error("Error fetching osteopaths:", error);
        throw error;
      }
    }
    
    await delay(300);
    return [...osteopaths];
  },
  
  async getOsteopathById(id: number): Promise<Osteopath | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Osteopath')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        return data as Osteopath;
      } catch (error) {
        console.error("Error fetching osteopath by ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    return osteopaths.find(o => o.id === id) || null;
  },

  async getOsteopathByUserId(userId: string): Promise<Osteopath | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Osteopath')
          .select('*')
          .eq('userId', userId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        return data as Osteopath;
      } catch (error) {
        console.error("Error fetching osteopath by user ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    return osteopaths.find(o => o.userId === userId) || null;
  },
  
  async createOsteopath(osteopath: Omit<Osteopath, "id" | "createdAt" | "updatedAt">): Promise<Osteopath> {
    if (USE_SUPABASE) {
      try {
        const now = new Date().toISOString();
        
        // Ensure we only include fields that match the Supabase schema
        const osteopathPayload = {
          name: osteopath.name,
          userId: osteopath.userId,
          professional_title: osteopath.professional_title,
          adeli_number: osteopath.adeli_number,
          siret: osteopath.siret,
          ape_code: osteopath.ape_code,
          createdAt: now,
          updatedAt: now
        };
        
        const { data, error } = await supabase
          .from('Osteopath')
          .insert(osteopathPayload)
          .select()
          .single();
          
        if (error) throw error;
        return data as Osteopath;
      } catch (error) {
        console.error("Error creating osteopath:", error);
        throw error;
      }
    }
    
    await delay(400);
    const now = new Date().toISOString();
    const newOsteopath: Osteopath = {
      ...osteopath,
      id: osteopaths.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    
    osteopaths.push(newOsteopath);
    return newOsteopath;
  },
  
  async updateOsteopath(id: number, updates: Partial<Osteopath>): Promise<Osteopath> {
    if (USE_SUPABASE) {
      try {
        // Ensure we only include fields that match the Supabase schema
        const osteopathPayload = {
          name: updates.name,
          userId: updates.userId,
          professional_title: updates.professional_title,
          adeli_number: updates.adeli_number,
          siret: updates.siret,
          ape_code: updates.ape_code,
          updatedAt: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('Osteopath')
          .update(osteopathPayload)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data as Osteopath;
      } catch (error) {
        console.error("Error updating osteopath:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = osteopaths.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error(`Osteopath with ID ${id} not found.`);
    }
    
    osteopaths[index] = {
      ...osteopaths[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return osteopaths[index];
  },
  
  async deleteOsteopath(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase
          .from('Osteopath')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error deleting osteopath:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = osteopaths.findIndex(o => o.id === id);
    
    if (index !== -1) {
      osteopaths.splice(index, 1);
      return true;
    }
    
    return false;
  }
};
