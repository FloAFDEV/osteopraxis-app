
import { ProfessionalProfile, ProfessionType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { delay, USE_SUPABASE } from "./config";

// Sample data for development
const profiles: ProfessionalProfile[] = [];

export const professionalProfileService = {
  async getProfessionalProfiles(): Promise<ProfessionalProfile[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('ProfessionalProfile')
          .select('*');
          
        if (error) throw error;
        return data as ProfessionalProfile[];
      } catch (error) {
        console.error("Error fetching professional profiles:", error);
        throw error;
      }
    }
    
    await delay(300);
    return [...profiles];
  },
  
  async getProfessionalProfileById(id: number): Promise<ProfessionalProfile | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('ProfessionalProfile')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        return data as ProfessionalProfile;
      } catch (error) {
        console.error("Error fetching professional profile by ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    const profile = profiles.find(p => p.id === id);
    return profile || null;
  },
  
  async getProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('ProfessionalProfile')
          .select('*')
          .eq('userId', userId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        return data as ProfessionalProfile;
      } catch (error) {
        console.error("Error fetching professional profile by user ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    const profile = profiles.find(p => p.userId === userId);
    return profile || null;
  },
  
  async createProfessionalProfile(data: Omit<ProfessionalProfile, "id" | "createdAt" | "updatedAt">): Promise<ProfessionalProfile> {
    if (USE_SUPABASE) {
      try {
        const now = new Date().toISOString();
        
        const { data: insertedData, error } = await supabase
          .from('ProfessionalProfile')
          .insert({
            ...data,
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
          
        if (error) throw error;
        return insertedData as ProfessionalProfile;
      } catch (error) {
        console.error("Error creating professional profile:", error);
        throw error;
      }
    }
    
    await delay(500);
    const now = new Date().toISOString();
    const newProfile = {
      ...data,
      id: profiles.length + 1,
      createdAt: now,
      updatedAt: now,
    } as ProfessionalProfile;
    
    profiles.push(newProfile);
    return newProfile;
  },
  
  async updateProfessionalProfile(id: number, data: Partial<ProfessionalProfile>): Promise<ProfessionalProfile> {
    if (USE_SUPABASE) {
      try {
        const { data: updatedData, error } = await supabase
          .from('ProfessionalProfile')
          .update({
            ...data,
            updatedAt: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return updatedData as ProfessionalProfile;
      } catch (error) {
        console.error("Error updating professional profile:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Professional profile with ID ${id} not found`);
    }
    
    profiles[index] = {
      ...profiles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return profiles[index];
  },
  
  // Add the missing deleteProfessionalProfile function
  async deleteProfessionalProfile(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase
          .from('ProfessionalProfile')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error deleting professional profile:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles.splice(index, 1);
      return true;
    }
    return false;
  }
};
