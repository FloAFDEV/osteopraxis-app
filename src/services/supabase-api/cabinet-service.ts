// Import types
import { Cabinet } from "@/types";
import { supabase, typedData } from "./utils";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return (data || []) as Cabinet[];
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return data as Cabinet;
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    if (!osteopathId) {
      console.log("Invalid osteopathId provided to getCabinetsByOsteopathId");
      return [];
    }
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathId);
      
    if (error) throw new Error(error.message);
    
    return (data || []) as Cabinet[];
  },
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    console.log("Searching for cabinets for userId:", userId);
    
    if (!userId) {
      console.log("Invalid userId provided to getCabinetsByUserId");
      return [];
    }
    
    try {
      // First get the osteopath ID for this user
      const { data: osteopathData, error: osteopathError } = await supabase
        .from("Osteopath")
        .select("id")
        .eq("userId", userId)
        .maybeSingle();
        
      if (osteopathError) {
        console.error("Error finding osteopath:", osteopathError);
        throw new Error(osteopathError.message);
      }
      
      if (!osteopathData) {
        console.log("No osteopath found for userId:", userId);
        return [];
      }
      
      console.log("Osteopath found with ID:", osteopathData.id);
      
      // Now get cabinets with this osteopath ID
      const { data: cabinets, error: cabinetsError } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("osteopathId", osteopathData.id);
        
      if (cabinetsError) throw new Error(cabinetsError.message);
      
      console.log(`${cabinets?.length || 0} cabinet(s) found for osteopath`);
      return (cabinets || []) as Cabinet[];
    } catch (error) {
      console.error("Exception while searching for cabinets:", error);
      throw error;
    }
  },

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    // Ne jamais envoyer id/timestamps, Postgres gère
    const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...insertable } = cabinet as any;
    const { data, error } = await supabase
      .from("Cabinet")
      .insert(insertable)
      .single();

    if (error) {
      console.error("[SUPABASE ERROR]", error.code, error.message);
      throw error;
    }

    return data as Cabinet;
  },

  async updateCabinet(id: number, cabinet: Partial<Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Cabinet> {
    const { data, error } = await supabase
      .from("Cabinet")
      .update({ ...cabinet, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return data as Cabinet;
  },

  async updateTimestamps(cabinetId: number): Promise<void> {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from("Cabinet")
      .update({ 
        updatedAt: now 
      })
      .eq("id", cabinetId);
      
    if (error) throw new Error(error.message);
  },

  async deleteCabinet(id: number): Promise<void> {
    const { error } = await supabase
      .from("Cabinet")
      .delete()
      .eq("id", id);
      
    if (error) throw new Error(error.message);
  }
};
