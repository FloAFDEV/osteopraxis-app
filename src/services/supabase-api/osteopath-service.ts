
import { Osteopath } from "@/types";
import { supabase, typedData, checkAuth } from "./utils";

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
      .maybeSingle();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data ? typedData<Osteopath>(data) : undefined;
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data ? typedData<Osteopath>(data) : undefined;
  },
  
  async updateOsteopath(id: number, osteopathData: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath> {
    // Vérifie l'authentification avant de procéder
    const session = await checkAuth();

    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("Osteopath")
      .update({
        ...osteopathData,
        updatedAt: now
      })
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Erreur lors de la mise à jour de l'ostéopathe:", error);
      throw new Error(error.message);
    }
    
    return typedData<Osteopath>(data);
  },
  
  async createOsteopath(osteopathData: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    // Vérifie l'authentification avant de procéder et récupère la session
    const session = await checkAuth();
    console.log("Création d'un ostéopathe avec la session authentifiée:", session.user.id);
    console.log("Données d'ostéopathe à insérer:", osteopathData);

    if (osteopathData.userId !== session.user.id) {
      console.warn("L'ID utilisateur ne correspond pas à l'ID de session. Ajustement automatique.");
      osteopathData.userId = session.user.id;
    }

    const now = new Date().toISOString();
    
    try {
      const { data, error } = await supabase
        .from("Osteopath")
        .insert({
          ...osteopathData,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();
        
      if (error) {
        console.error("Erreur Supabase createOsteopath:", error);
        throw new Error(error.message);
      }
      
      console.log("Ostéopathe créé avec succès:", data);
      return typedData<Osteopath>(data);
    } catch (error: any) {
      console.error("Exception Supabase createOsteopath:", error);
      throw error;
    }
  }
};
