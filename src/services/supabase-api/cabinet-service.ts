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

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    const { data, error } = await supabase
      .from("Cabinet")
      .insert(cabinet) // Modification ici : cabinet est déjà un objet, pas besoin de l'encadrer dans un tableau supplémentaire
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
