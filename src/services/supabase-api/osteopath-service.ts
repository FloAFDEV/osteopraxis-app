import { Osteopath } from "@/types";
import { supabase, typedData, checkAuth } from "./utils";

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    try {
      console.log("Tentative de récupération de tous les ostéopathes");
      const { data, error } = await supabase
        .from("Osteopath")
        .select("*");
        
      if (error) {
        console.error("Erreur lors de la récupération des ostéopathes:", error);
        throw new Error(error.message);
      }
      
      console.log("Ostéopathes récupérés avec succès:", data?.length || 0);
      return typedData<Osteopath[]>(data);
    } catch (error) {
      console.error("Exception lors de la récupération des ostéopathes:", error);
      throw error;
    }
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    try {
      console.log(`Tentative de récupération de l'ostéopathe avec l'ID: ${id}`);
      const { data, error } = await supabase
        .from("Osteopath")
        .select("*")
        .eq("id", id)
        .maybeSingle();
        
      if (error) {
        console.error(`Erreur lors de la récupération de l'ostéopathe (ID: ${id}):`, error);
        throw new Error(error.message);
      }
      
      console.log(`Résultat de la recherche d'ostéopathe (ID: ${id}):`, data ? "Trouvé" : "Non trouvé");
      return data ? typedData<Osteopath>(data) : undefined;
    } catch (error) {
      console.error(`Exception lors de la récupération de l'ostéopathe (ID: ${id}):`, error);
      throw error;
    }
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    try {
      console.log(`Tentative de récupération de l'ostéopathe pour l'utilisateur: ${userId}`);
      const { data, error } = await supabase
        .from("Osteopath")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();
        
      if (error) {
        console.error(`Erreur lors de la récupération de l'ostéopathe pour l'utilisateur (ID: ${userId}):`, error);
        throw new Error(error.message);
      }
      
      console.log(`Résultat de la recherche d'ostéopathe pour l'utilisateur (ID: ${userId}):`, data ? "Trouvé" : "Non trouvé");
      return data ? typedData<Osteopath>(data) : undefined;
    } catch (error) {
      console.error(`Exception lors de la récupération de l'ostéopathe pour l'utilisateur (ID: ${userId}):`, error);
      throw error;
    }
  },
  
  async createOsteopath(osteopathData: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    try {
      // Vérifie l'authentification avant de procéder et récupère la session
      const session = await checkAuth();
      console.log("Création d'un ostéopathe avec la session authentifiée:", session.user.id);
      console.log("Données d'ostéopathe à insérer:", osteopathData);

      // Vérification que l'ID utilisateur correspond bien à celui de la session
      if (osteopathData.userId !== session.user.id) {
        console.warn("L'ID utilisateur ne correspond pas à l'ID de session. Ajustement automatique.");
        osteopathData.userId = session.user.id;
      }

      const now = new Date().toISOString();
      
      // Utiliser un try-catch supplémentaire pour mieux diagnostiquer les erreurs d'insertion
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
          console.error("Code:", error.code);
          console.error("Details:", error.details);
          console.error("Hint:", error.hint);
          console.error("Message:", error.message);
          throw new Error(error.message);
        }
        
        console.log("Ostéopathe créé avec succès:", data);
        return typedData<Osteopath>(data);
      } catch (insertError: any) {
        console.error("Exception lors de l'insertion dans Osteopath:", insertError);
        
        // Vérifier si c'est une erreur de permission RLS
        if (insertError.message?.includes('permission denied')) {
          console.error("Erreur de permission, détails:", {
            userId: osteopathData.userId,
            sessionUserId: session.user.id,
            isAuthenticated: !!session
          });
          
          // Tenter une approche alternative avec directement l'ID utilisateur de la session
          console.log("Tentative alternative avec l'ID utilisateur de la session");
          const { data, error } = await supabase
            .from("Osteopath")
            .insert({
              ...osteopathData,
              userId: session.user.id, // Force l'utilisation de l'ID utilisateur de la session
              createdAt: now,
              updatedAt: now
            })
            .select()
            .single();
            
          if (error) {
            console.error("Erreur lors de la tentative alternative:", error);
            throw error;
          }
          
          console.log("Création réussie avec la tentative alternative:", data);
          return typedData<Osteopath>(data);
        }
        
        throw insertError;
      }
    } catch (error: any) {
      console.error("Exception Supabase createOsteopath:", error);
      throw error;
    }
  },
  
  async updateOsteopath(id: number, osteopathData: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath> {
    try {
      // Vérifie l'authentification avant de procéder
      const session = await checkAuth();
      console.log(`Tentative de mise à jour de l'ostéopathe (ID: ${id}) par l'utilisateur: ${session.user.id}`);
      
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
        console.error(`Erreur lors de la mise à jour de l'ostéopathe (ID: ${id}):`, error);
        throw new Error(error.message);
      }
      
      console.log(`Ostéopathe (ID: ${id}) mis à jour avec succès`);
      return typedData<Osteopath>(data);
    } catch (error) {
      console.error(`Exception lors de la mise à jour de l'ostéopathe (ID: ${id}):`, error);
      throw error;
    }
  },
};
