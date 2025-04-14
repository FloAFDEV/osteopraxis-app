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
    
    if (!userId) {
      console.log("UserId invalide fourni à getOsteopathByUserId");
      return undefined;
    }
    
    try {
      console.log("Exécution de la requête avec userId:", userId);
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session actuelle:", sessionData.session ? "Authentifié" : "Non authentifié");
      
      const { data, error } = await supabase
        .from("Osteopath")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();
        
      if (error) {
        console.error("Erreur lors de la recherche de l'ostéopathe:", error);
        throw new Error(error.message);
      }
      
      if (!data) {
        console.log("Aucun ostéopathe trouvé avec l'userId:", userId);
        // Afficher les ostéopathes existants pour le débogage
        const { data: allOsteos, error: allOsteosError } = await supabase
          .from("Osteopath")
          .select("id, userId")
          .limit(5);
          
        if (!allOsteosError && allOsteos) {
          console.log("Voici les 5 premiers ostéopathes dans la base:", allOsteos);
        }
        
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
    try {
      console.log(`Mise à jour de l'ostéopathe ID ${id} avec les données:`, data);
      const { data: updatedOsteo, error } = await supabase
        .from("Osteopath")
        .update(data)
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      console.log("Ostéopathe mis à jour avec succès:", updatedOsteo);
      return typedData<Osteopath>(updatedOsteo);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'ostéopathe:", error);
      throw error;
    }
  },
  
  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    const now = new Date().toISOString();
    
    console.log("Création d'un ostéopathe avec les données:", data);
    
    try {
      const { data: newOsteopath, error } = await supabase
        .from("Osteopath")
        .insert({
          ...data,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'insertion de l'ostéopathe:", error);
        throw error;
      }
      
      console.log("Ostéopathe créé avec succès via insertion directe:", newOsteopath);
      return newOsteopath;
    } catch (error) {
      console.error("Erreur lors de la création de l'ostéopathe:", error);
      throw error;
    }
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
