
import { Cabinet } from "@/types";
import { supabase, addAuthHeaders } from "./utils";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Cabinet")
          .select("*")
          .order('name', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      return data.map(cabinet => ({
        id: cabinet.id,
        name: cabinet.name,
        address: cabinet.address,
        phone: cabinet.phone,
        osteopathId: cabinet.osteopathId,
        createdAt: cabinet.createdAt,
        updatedAt: cabinet.updatedAt
      }));
    } catch (error) {
      console.error("Erreur getCabinets:", error);
      throw error;
    }
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Cabinet")
          .select("*")
          .eq("osteopathId", osteopathId)
          .order('name', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      return data.map(cabinet => ({
        id: cabinet.id,
        name: cabinet.name,
        address: cabinet.address,
        phone: cabinet.phone,
        osteopathId: cabinet.osteopathId,
        createdAt: cabinet.createdAt,
        updatedAt: cabinet.updatedAt
      }));
    } catch (error) {
      console.error("Erreur getCabinetsByOsteopathId:", error);
      throw error;
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Cabinet")
          .select("*")
          .eq("id", id)
          .maybeSingle()
      );
      
      const { data, error } = await query;
      
      if (error) {
        if (error.code === "PGRST116") {
          return undefined;
        }
        throw new Error(error.message);
      }
      
      if (!data) return undefined;
      
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        osteopathId: data.osteopathId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      console.error("Erreur getCabinetById:", error);
      throw error;
    }
  },

  async createCabinet(cabinetData: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      const now = new Date().toISOString();
      
      const cabinetToCreate = {
        ...cabinetData,
        createdAt: now,
        updatedAt: now
      };
      
      const query = addAuthHeaders(
        supabase
          .from("Cabinet")
          .insert(cabinetToCreate)
          .select()
          .single()
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        osteopathId: data.osteopathId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      console.error("Erreur createCabinet:", error);
      throw error;
    }
  },

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet | undefined> {
    try {
      const updateData = {
        ...cabinetData,
        updatedAt: new Date().toISOString()
      };
      
      const query = addAuthHeaders(
        supabase
          .from("Cabinet")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        osteopathId: data.osteopathId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      console.error("Erreur updateCabinet:", error);
      throw error;
    }
  },
  
  async deleteCabinet(id: number): Promise<boolean> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Cabinet")
          .delete()
          .eq("id", id)
      );
      
      const { error } = await query;
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      console.error("Erreur deleteCabinet:", error);
      throw error;
    }
  }
};
