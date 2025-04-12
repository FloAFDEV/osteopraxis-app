
// Import des types depuis le fichier des types
import { Osteopath } from "@/types";
import { supabase, typedData } from "./utils";

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return typedData<Osteopath[]>(data);
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        console.log("Ostéopathe non trouvé avec l'ID:", id);
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return typedData<Osteopath>(data);
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    console.log("Recherche d'un ostéopathe avec l'userId:", userId);
    
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("userId", userId);
      
    if (error) {
      console.error("Erreur lors de la recherche de l'ostéopathe:", error);
      throw new Error(error.message);
    }
    
    // Vérifier si nous avons des données
    if (!data || data.length === 0) {
      console.log("Aucun ostéopathe trouvé avec l'userId:", userId);
      
      // Si aucun ostéopathe n'est trouvé, vérifions s'il y a un seul ostéopathe dans la table
      const { data: allOsteopaths, error: allError } = await supabase
        .from("Osteopath")
        .select("*");
      
      if (allError) {
        console.error("Erreur lors de la récupération de tous les ostéopathes:", allError);
        return undefined;
      }
      
      if (allOsteopaths && allOsteopaths.length === 1) {
        console.log("Un seul ostéopathe trouvé dans la base, on l'associe automatiquement");
        
        // Mettre à jour l'ostéopathe avec l'ID utilisateur
        const osteopathToUpdate = allOsteopaths[0];
        const { data: updatedOsteo, error: updateError } = await supabase
          .from("Osteopath")
          .update({ userId: userId })
          .eq("id", osteopathToUpdate.id)
          .select();
        
        if (updateError) {
          console.error("Erreur lors de la mise à jour de l'ostéopathe:", updateError);
          return undefined;
        }
        
        // Retourner l'ostéopathe mis à jour
        return typedData<Osteopath>(updatedOsteo[0]);
      }
      
      return undefined;
    }
    
    console.log("Ostéopathe trouvé:", data[0]);
    return typedData<Osteopath>(data[0]);
  },
  
  async updateOsteopath(id: number, data: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath | undefined> {
    const { data: updatedOsteo, error } = await supabase
      .from("Osteopath")
      .update(data)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return typedData<Osteopath>(updatedOsteo);
  },
  
  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    const now = new Date().toISOString();
    
    // Ajout des timestamps requis par le schéma Supabase
    const osteopathWithTimestamps = {
      ...data,
      updatedAt: now,
      createdAt: now
    };
    
    const { data: newOsteo, error } = await supabase
      .from("Osteopath")
      .insert(osteopathWithTimestamps)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return typedData<Osteopath>(newOsteo);
  }
};
