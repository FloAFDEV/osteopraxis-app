
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      const { data: cabinets, error } = await supabase
        .from("Cabinet")
        .select("*");

      if (error) {
        console.error("Error fetching cabinets:", error);
        throw error;
      }

      return (cabinets || []) as Cabinet[];
    } catch (error) {
      console.error("Error in getCabinets:", error);
      return [];
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | null> {
    try {
      const { data, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching cabinet by ID:", error);
        throw error;
      }

      return data as Cabinet;
    } catch (error) {
      console.error("Error in getCabinetById:", error);
      return null;
    }
  },

  async getCabinetsByProfessionalProfileId(professionalProfileId: number): Promise<Cabinet[]> {
    try {
      const { data: cabinets, error } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("professionalProfileId", professionalProfileId);

      if (error) {
        console.error("Error fetching cabinets by professional profile ID:", error);
        throw error;
      }

      return (cabinets || []) as Cabinet[];
    } catch (error) {
      console.error("Error in getCabinetsByProfessionalProfileId:", error);
      return [];
    }
  },

  async createCabinet(cabinetData: Omit<Cabinet, "id" | "createdAt" | "updatedAt">): Promise<Cabinet> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("Cabinet")
        .insert({
          ...cabinetData,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating cabinet:", error);
        throw error;
      }

      return data as Cabinet;
    } catch (error) {
      console.error("Error in createCabinet:", error);
      throw error;
    }
  },

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("Cabinet")
        .update({
          ...cabinetData,
          updatedAt: now,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating cabinet:", error);
        throw error;
      }

      return data as Cabinet;
    } catch (error) {
      console.error("Error in updateCabinet:", error);
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
        console.error("Error deleting cabinet:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteCabinet:", error);
      throw error;
    }
  },

  // Legacy compatibility methods
  getCabinetsByOsteopathId: async function(osteopathId: number): Promise<Cabinet[]> {
    console.warn("getCabinetsByOsteopathId is deprecated, use getCabinetsByProfessionalProfileId instead");
    return this.getCabinetsByProfessionalProfileId(osteopathId);
  }
};
