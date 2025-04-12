
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
    
    try {
      // Utiliser maybeSingle au lieu de single pour éviter l'erreur si aucun résultat n'est trouvé
      const { data, error } = await supabase
        .from("Osteopath")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();
        
      if (error) {
        console.error("Erreur lors de la recherche de l'ostéopathe:", error);
        throw new Error(error.message);
      }
      
      // Vérifier si nous avons des données
      if (!data) {
        console.log("Aucun ostéopathe trouvé avec l'userId:", userId);
        return undefined;
      }
      
      console.log("Ostéopathe trouvé:", data);
      return typedData<Osteopath>(data);
    } catch (error) {
      console.error("Exception lors de la recherche de l'ostéopathe:", error);
      throw error;
    }
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
    
    console.log("Création d'un ostéopathe avec les données:", data);
    
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
      
    if (error) {
      console.error("Erreur lors de la création de l'ostéopathe:", error);
      throw new Error(error.message);
    }
    
    console.log("Ostéopathe créé avec succès:", newOsteo);
    return typedData<Osteopath>(newOsteo);
  },
  
  async hasRequiredFields(osteopathId: number): Promise<boolean> {
    try {
      const osteopath = await supabaseOsteopathService.getOsteopathById(osteopathId);
      
      if (!osteopath) return false;
      
      // Vérifier si les champs obligatoires pour les factures sont présents
      return (
        !!osteopath.adeli_number && 
        !!osteopath.siret && 
        !!osteopath.name && 
        !!osteopath.professional_title
      );
    } catch (error) {
      console.error("Erreur lors de la vérification des champs obligatoires:", error);
      return false;
    }
  }
};
