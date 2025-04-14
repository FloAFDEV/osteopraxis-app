
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
      // Vérifier l'état de la session avant d'exécuter la requête
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("État de la session:", sessionData.session ? "Authentifié" : "Non authentifié");
      
      if (!sessionData.session) {
        console.log("Utilisateur non authentifié, impossible de récupérer l'ostéopathe");
        return undefined;
      }
      
      // Log pour comparer l'userId de la session avec celui passé en paramètre
      console.log("ID utilisateur de la session:", sessionData.session.user.id);
      console.log("ID utilisateur passé en paramètre:", userId);
      
      // Rechercher par l'userId exact correspondant à celui de la base de données
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
          console.log("Ostéopathes existants dans la base:", allOsteos);
          
          // Essayer de correspondre avec un ostéopathe en ignorant la casse
          const matchedOsteo = allOsteos.find(
            o => o.userId && o.userId.toLowerCase() === userId.toLowerCase()
          );
          
          if (matchedOsteo) {
            console.log("Ostéopathe trouvé en ignorant la casse, ID:", matchedOsteo.id);
            
            // Récupérer l'ostéopathe complet
            const { data: fullOsteo } = await supabase
              .from("Osteopath")
              .select("*")
              .eq("id", matchedOsteo.id)
              .single();
              
            return typedData<Osteopath>(fullOsteo);
          }
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
      // Vérifier l'état de la session avant d'exécuter la requête
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("État de la session pour création:", sessionData.session ? "Authentifié" : "Non authentifié");
      
      if (!sessionData.session) {
        throw new Error("Utilisateur non authentifié");
      }
      
      // S'assurer que l'userId est cohérent avec celui de la session
      const userId = data.userId || sessionData.session.user.id;
      console.log("Utilisation de l'userId pour création:", userId);
      
      const { data: newOsteopath, error } = await supabase
        .from("Osteopath")
        .insert({
          ...data,
          userId: userId,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'insertion de l'ostéopathe:", error);
        
        // Tenter d'utiliser la fonction edge comme alternative
        console.log("Tentative d'utilisation de la fonction edge pour création d'ostéopathe");
        const edgeFunctionUrl = "https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil";
        
        const response = await fetch(edgeFunctionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            osteopathData: {
              ...data,
              userId: userId
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur de la fonction edge:", errorText);
          throw new Error(`Fonction edge a échoué: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log("Résultat de la création via fonction edge:", result);
        
        if (result && result.osteopath) {
          return result.osteopath;
        }
        
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
