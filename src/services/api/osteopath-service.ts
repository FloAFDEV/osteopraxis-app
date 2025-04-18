import { Osteopath } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseOsteopathService } from "../supabase-api/osteopath-service";
import { supabase } from '@/integrations/supabase/client';

export const osteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    try {
      return await supabaseOsteopathService.getOsteopaths();
    } catch (error) {
      console.error("Erreur Supabase getOsteopaths:", error);
      throw error; // Propagation de l'erreur au lieu de fallback
    }
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    try {
      return await supabaseOsteopathService.getOsteopathById(id);
    } catch (error) {
      console.error("Erreur Supabase getOsteopathById:", error);
      throw error; // Propagation de l'erreur au lieu de fallback
    }
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    console.log(`Recherche d'ostéopathe par userId: ${userId}`);
    
    try {
      // Ajout d'un délai court pour s'assurer que l'authentification est établie
      await delay(300);
      
      // Debug log de la session actuelle
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (sessionData && sessionData.session) {
        console.log("Utilisateur authentifié:", sessionData.session.user.id);
        console.log("Token d'accès présent:", !!sessionData.session.access_token);
      } else {
        console.log("Pas de session active:", error || "Aucune erreur");
      }
      
      // Rechercher un ostéopathe existant pour cet utilisateur
      const result = await supabaseOsteopathService.getOsteopathByUserId(userId);
      
      // Si un ostéopathe est trouvé, le retourner
      if (result) {
        console.log("Ostéopathe trouvé:", result);
        return result;
      }
      
      console.log("Aucun ostéopathe trouvé, création d'un profil par défaut...");
      
      // Si aucun ostéopathe n'est trouvé, en créer un par défaut
      try {
        if (!sessionData || !sessionData.session) {
          console.error("Pas de session pour créer un ostéopathe");
          throw new Error("Pas de session active");
        }
        
        // Récupérer les informations de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("first_name, last_name, email")
          .eq("id", userId)
          .maybeSingle();
        
        if (userError) {
          console.error("Erreur lors de la récupération des données utilisateur:", userError);
          throw userError;
        }
        
        // Créer le nom d'ostéopathe à partir des données utilisateur
        let osteopathName = "Ostéopathe";
        if (userData) {
          if (userData.first_name && userData.last_name) {
            osteopathName = `${userData.first_name} ${userData.last_name}`;
          } else if (userData.first_name) {
            osteopathName = userData.first_name;
          } else if (userData.last_name) {
            osteopathName = userData.last_name;
          } else if (userData.email) {
            // Extraire un nom à partir de l'email
            const emailName = userData.email.split('@')[0];
            osteopathName = emailName
              .split(/[._-]/)
              .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(' ');
          }
        }
        
        // Créer un nouvel ostéopathe
        const now = new Date().toISOString();
        const { data: newOsteopath, error: osteoError } = await supabase
          .from("Osteopath")
          .insert({
            userId: userId,
            name: osteopathName,
            professional_title: "Ostéopathe D.O.",
            ape_code: "8690F",
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
        
        if (osteoError) {
          console.error("Erreur lors de la création du profil ostéopathe:", osteoError);
          throw osteoError;
        }
        
        if (newOsteopath) {
          console.log("Nouveau profil ostéopathe créé:", newOsteopath);
          
          // Mettre à jour l'utilisateur avec l'ID de l'ostéopathe
          const { error: updateError } = await supabase
            .from("User")
            .update({ osteopathId: newOsteopath.id })
            .eq("id", userId);
          
          if (updateError) {
            console.error("Erreur lors de la mise à jour de l'utilisateur avec l'ID ostéopathe:", updateError);
          }
          
          return newOsteopath as Osteopath;
        }
        
        throw new Error("Échec de création du profil ostéopathe");
      } catch (error) {
        console.error("Erreur lors de la création automatique du profil ostéopathe:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erreur Supabase getOsteopathByUserId:", error);
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
      return updatedOsteo as Osteopath;
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
        throw error;
      }
      
      console.log("Ostéopathe créé avec succès via insertion directe:", newOsteopath);
      return newOsteopath as Osteopath;
    } catch (error) {
      console.error("Erreur lors de la création de l'ostéopathe:", error);
      throw error;
    }
  },
  
  async hasRequiredFields(osteopathId: number): Promise<boolean> {
    try {
      const osteopath = await this.getOsteopathById(osteopathId);
      
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
