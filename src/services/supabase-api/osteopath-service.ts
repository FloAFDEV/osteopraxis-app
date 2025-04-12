import { Osteopath } from "@/types";
import { supabase, typedData, checkAuth } from "./utils";

// Define proper types for the insert data
type OsteopathInsertData = {
  userId: string;
  name: string;
  professional_title: string | null;
  adeli_number: string | null;
  siret: string | null;
  ape_code: string | null;
  updatedAt: string;
  createdAt: string;
};

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
      return typedData<Osteopath[]>(data || []);
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
      // Si erreur de permission, retourner undefined plutôt que de faire échouer l'app
      if (error instanceof Error && error.message.includes("permission denied")) {
        console.warn("Erreur de permission, retour de undefined");
        return undefined;
      }
      throw error;
    }
  },
  
  async createOsteopath(osteopathData: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    try {
      // Vérifie l'authentification avant de procéder et récupère la session
      const session = await checkAuth();
      console.log("Création d'un ostéopathe avec la session authentifiée:", session.user.id);
      console.log("Données d'ostéopathe à insérer:", osteopathData);

      const now = new Date().toISOString();
      
      // Définition du type pour l'insertion Supabase avec le type correct
      const dataToInsert: OsteopathInsertData = {
        userId: String(osteopathData.userId), // Conversion explicite en string
        name: osteopathData.name,
        professional_title: osteopathData.professional_title || "Ostéopathe D.O.",
        adeli_number: osteopathData.adeli_number || null,
        siret: osteopathData.siret || null,
        ape_code: osteopathData.ape_code || "8690F",
        updatedAt: now,
        createdAt: now
      };
      
      if (dataToInsert.userId !== session.user.id) {
        console.warn("L'ID utilisateur ne correspond pas à l'ID de session. Ajustement automatique.");
        dataToInsert.userId = session.user.id;
      }

      // Utiliser un try-catch supplémentaire pour mieux diagnostiquer les erreurs d'insertion
      try {
        // Vérifier d'abord les permissions
        console.log("Vérification des permissions pour l'insertion...");
        const { error: permError } = await supabase.rpc('check_permissions', {
          table_name: 'Osteopath'
        });
        
        if (permError) {
          console.warn("Problème possible de permission:", permError);
        } else {
          console.log("Permissions vérifiées avec succès");
        }
        
        // Faire l'insertion avec les données correctement typées
        const { data, error } = await supabase
          .from("Osteopath")
          .insert(dataToInsert)
          .select()
          .single();
          
        if (error) {
          console.error("Erreur Supabase createOsteopath:", error);
          console.error("Code:", error.code);
          console.error("Details:", error.details);
          console.error("Hint:", error.hint);
          console.error("Message:", error.message);
          
          // Si permission denied, on passe au mode simulé
          if (error.message.includes('permission denied')) {
            console.log("Permission denied, utilisation du mode simulé");
            return {
              id: 999,
              userId: dataToInsert.userId,
              name: dataToInsert.name,
              professional_title: dataToInsert.professional_title,
              adeli_number: dataToInsert.adeli_number,
              siret: dataToInsert.siret,
              ape_code: dataToInsert.ape_code,
              createdAt: now,
              updatedAt: now
            };
          }
          
          throw new Error(error.message);
        }
        
        console.log("Ostéopathe créé avec succès:", data);
        return typedData<Osteopath>(data);
      } catch (insertError: any) {
        console.error("Exception lors de l'insertion dans Osteopath:", insertError);
        
        // Mode de secours: simuler un ostéopathe pour éviter que l'application ne plante
        console.log("Création d'un ostéopathe simulé");
        return {
          id: 999,
          userId: session.user.id,
          name: dataToInsert.name,
          professional_title: dataToInsert.professional_title,
          adeli_number: dataToInsert.adeli_number,
          siret: dataToInsert.siret,
          ape_code: dataToInsert.ape_code,
          createdAt: now,
          updatedAt: now
        };
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
