
import { Cabinet } from "@/types";
import { supabase } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";
import { removeNullProperties } from "./invoice-adapter";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*");

      if (error) {
        console.error("Erreur lors de la récupération des cabinets:", error);
        throw error;
      }

      return (data || []) as Cabinet[];
    } catch (error) {
      console.error("Error fetching cabinets:", error);
      throw error;
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    try {
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Erreur lors de la récupération du cabinet avec l'ID ${id}:`, error);
        return undefined;
      }

      return data as Cabinet;
    } catch (error) {
      console.error(`Error fetching cabinet with ID ${id}:`, error);
      throw error;
    }
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    try {
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("osteopathId", osteopathId);

      if (error) {
        console.error(`Erreur lors de la récupération des cabinets pour l'ostéopathe avec l'ID ${osteopathId}:`, error);
        throw error;
      }

      return (data || []) as Cabinet[];
    } catch (error) {
      console.error(`Error fetching cabinets for osteopath with ID ${osteopathId}:`, error);
      throw error;
    }
  },

  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    try {
      // This is a simplified implementation. You might need to adjust the query
      // based on your actual database schema and relationships.
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("userId", userId);

      if (error) {
        console.error(`Erreur lors de la récupération des cabinets pour l'utilisateur avec l'ID ${userId}:`, error);
        throw error;
      }

      return (data || []) as Cabinet[];
    } catch (error) {
      console.error(`Error fetching cabinets for user with ID ${userId}:`, error);
      throw error;
    }
  },

  async createCabinet(cabinetData: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      const { data, error } = await supabase
        .from("Cabinet")
        .insert([
          {
            ...cabinetData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du cabinet:", error);
        throw error;
      }

      return data as Cabinet;
    } catch (error) {
      console.error("Error creating cabinet:", error);
      throw error;
    }
  },

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet | undefined> {
    try {
      // Remove null properties to prevent type issues
      const cleanedData = removeNullProperties(cabinetData);
      
      const { data, error } = await supabase
        .from("Cabinet")
        .update({
          ...cleanedData,
          updatedAt: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Erreur lors de la mise à jour du cabinet avec l'ID ${id}:`, error);
        throw error;
      }

      return data as Cabinet;
    } catch (error) {
      console.error(`Error updating cabinet with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteCabinet(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("Cabinet")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Erreur lors de la suppression du cabinet avec l'ID ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting cabinet with ID ${id}:`, error);
      throw error;
    }
  }
};
