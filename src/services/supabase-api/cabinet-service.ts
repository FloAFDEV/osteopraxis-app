
// Import des types depuis le fichier des types
import { Cabinet } from "@/types";
import { supabase, typedData } from "./utils";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return typedData<Cabinet[]>(data);
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
    
    return typedData<Cabinet>(data);
  },

  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathId);
      
    if (error) throw new Error(error.message);
    
    return typedData<Cabinet[]>(data);
  },
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    console.log("Recherche des cabinets pour l'userId:", userId);
    
    try {
      // First get the osteopath ID for this user
      const { data: osteopathData, error: osteopathError } = await supabase
        .from("Osteopath")
        .select("id")
        .eq("userId", userId)
        .maybeSingle();
        
      if (osteopathError) {
        console.error("Erreur lors de la recherche de l'ostéopathe:", osteopathError);
        throw new Error(osteopathError.message);
      }
      
      if (!osteopathData) {
        console.log("Aucun ostéopathe trouvé pour l'userId:", userId);
        return [];
      }
      
      console.log("Ostéopathe trouvé avec l'ID:", osteopathData.id);
      
      // Now get cabinets with this osteopath ID
      const { data: cabinets, error: cabinetsError } = await supabase
        .from("Cabinet")
        .select("*")
        .eq("osteopathId", osteopathData.id);
        
      if (cabinetsError) throw new Error(cabinetsError.message);
      
      console.log(`${cabinets?.length || 0} cabinet(s) trouvé(s) pour l'ostéopathe`);
      return typedData<Cabinet[]>(cabinets || []);
    } catch (error) {
      console.error("Exception lors de la recherche des cabinets:", error);
      throw error;
    }
  },

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    const now = new Date().toISOString();
    
    // Add timestamps required by Supabase schema
    const cabinetWithTimestamps = {
      ...cabinet,
      updatedAt: now,
      createdAt: now
    };
    
    const { data, error } = await supabase
      .from("Cabinet")
      .insert(cabinetWithTimestamps)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return typedData<Cabinet>(data);
  },

  async updateCabinet(id: number, cabinet: Partial<Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Cabinet> {
    const { data, error } = await supabase
      .from("Cabinet")
      .update(cabinet)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return typedData<Cabinet>(data);
  },

  async updateTimestamps(cabinetId: number): Promise<void> {
    const now = new Date().toISOString();
    
    // Correction: Assurez-vous que tous les champs requis sont présents
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
