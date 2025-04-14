
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
      // Log de la session actuelle pour voir si nous sommes authentifiés
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session actuelle:", sessionData.session ? "Authentifié" : "Non authentifié");
      
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
        
        // Si aucun résultat, faire une recherche directe dans la DB pour voir s'il y a des ostéopathes
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
      // Essayer d'abord l'insertion directe via l'API Supabase
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
        console.error("Erreur lors de l'insertion directe de l'ostéopathe:", error);
        
        // Si l'insertion directe échoue, essayer avec la fonction edge
        console.log("Tentative d'utiliser la fonction edge comme fallback");
        const response = await fetch(
          "https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({ osteopathData: data })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur de la fonction edge:", errorData);
          throw new Error(`Erreur lors de la création de l'ostéopathe: ${errorData.error || 'Fonction edge échouée'}`);
        }
        
        const result = await response.json();
        console.log("Résultat de la création via fonction edge:", result);
        
        return result.osteopath;
      }
      
      console.log("Ostéopathe créé avec succès via insertion directe:", newOsteopath);
      return newOsteopath;
    } catch (error) {
      console.error("Erreur lors de la création de l'ostéopathe:", error);
      
      // Dernière tentative - créer un ostéopathe minimal avec les données essentielles
      try {
        console.log("Tentative de création d'un ostéopathe minimal");
        const { data: minimalOsteopath, error: minError } = await supabase
          .from("Osteopath")
          .insert({
            name: data.name || "Ostéopathe",
            userId: data.userId,
            professional_title: "Ostéopathe D.O.",
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
          
        if (minError) {
          console.error("Échec de la création d'un ostéopathe minimal:", minError);
          throw minError;
        }
        
        console.log("Ostéopathe minimal créé avec succès:", minimalOsteopath);
        return minimalOsteopath;
      } catch (finalError) {
        console.error("Toutes les tentatives de création d'ostéopathe ont échoué:", finalError);
        throw error;
      }
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
