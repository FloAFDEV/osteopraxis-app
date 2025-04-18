
import { ProfessionalProfile } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseProfessionalProfileService } from "../supabase-api/professional-profile-service";
import { supabase } from '@/integrations/supabase/client';

export const professionalProfileService = {
  async getProfessionalProfiles(): Promise<ProfessionalProfile[]> {
    try {
      return await supabaseProfessionalProfileService.getProfessionalProfiles();
    } catch (error) {
      console.error("Erreur Supabase getProfessionalProfiles:", error);
      throw error;
    }
  },

  async getProfessionalProfileById(id: number): Promise<ProfessionalProfile | undefined> {
    try {
      return await supabaseProfessionalProfileService.getProfessionalProfileById(id);
    } catch (error) {
      console.error("Erreur Supabase getProfessionalProfileById:", error);
      throw error;
    }
  },
  
  async getProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | undefined> {
    console.log(`Recherche de profil professionnel par userId: ${userId}`);
    
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
      
      // Rechercher un profil existant pour cet utilisateur
      const result = await supabaseProfessionalProfileService.getProfessionalProfileByUserId(userId);
      
      // Si un profil est trouvé, le retourner
      if (result) {
        console.log("Profil professionnel trouvé:", result);
        return result;
      }
      
      console.log("Aucun profil trouvé, création d'un profil par défaut...");
      
      // Si aucun profil n'est trouvé, en créer un par défaut
      try {
        if (!sessionData || !sessionData.session) {
          console.error("Pas de session pour créer un profil");
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
        
        // Créer le nom du professionnel à partir des données utilisateur
        let professionalName = "Professionnel";
        if (userData) {
          if (userData.first_name && userData.last_name) {
            professionalName = `${userData.first_name} ${userData.last_name}`;
          } else if (userData.first_name) {
            professionalName = userData.first_name;
          } else if (userData.last_name) {
            professionalName = userData.last_name;
          } else if (userData.email) {
            // Extraire un nom à partir de l'email
            const emailName = userData.email.split('@')[0];
            professionalName = emailName
              .split(/[._-]/)
              .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(' ');
          }
        }
        
        // Créer un nouveau profil professionnel
        const now = new Date().toISOString();
        const { data: newProfile, error: profileError } = await supabase
          .from("ProfessionalProfile")
          .insert({
            userId: userId,
            name: professionalName,
            title: "Ostéopathe D.O.",
            profession_type: "osteopathe",
            ape_code: "8690F",
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
        
        if (profileError) {
          console.error("Erreur lors de la création du profil professionnel:", profileError);
          throw profileError;
        }
        
        if (newProfile) {
          console.log("Nouveau profil professionnel créé:", newProfile);
          
          // Mettre à jour l'utilisateur avec l'ID du profil
          const { error: updateError } = await supabase
            .from("User")
            .update({ professionalProfileId: newProfile.id })
            .eq("id", userId);
          
          if (updateError) {
            console.error("Erreur lors de la mise à jour de l'utilisateur avec l'ID du profil:", updateError);
          }
          
          return newProfile as ProfessionalProfile;
        }
        
        throw new Error("Échec de création du profil professionnel");
      } catch (error) {
        console.error("Erreur lors de la création automatique du profil professionnel:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erreur Supabase getProfessionalProfileByUserId:", error);
      throw error;
    }
  },
  
  async updateProfessionalProfile(id: number, data: Partial<Omit<ProfessionalProfile, 'id' | 'createdAt'>>): Promise<ProfessionalProfile | undefined> {
    try {
      console.log(`Mise à jour du profil ID ${id} avec les données:`, data);
      const { data: updatedProfile, error } = await supabase
        .from("ProfessionalProfile")
        .update(data)
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      console.log("Profil professionnel mis à jour avec succès:", updatedProfile);
      return updatedProfile as ProfessionalProfile;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil professionnel:", error);
      throw error;
    }
  },
  
  async createProfessionalProfile(data: Omit<ProfessionalProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfessionalProfile> {
    const now = new Date().toISOString();
    
    console.log("Création d'un profil professionnel avec les données:", data);
    
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
      
      const { data: newProfile, error } = await supabase
        .from("ProfessionalProfile")
        .insert({
          ...data,
          userId: userId,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'insertion du profil professionnel:", error);
        throw error;
      }
      
      console.log("Profil professionnel créé avec succès via insertion directe:", newProfile);
      return newProfile as ProfessionalProfile;
    } catch (error) {
      console.error("Erreur lors de la création du profil professionnel:", error);
      throw error;
    }
  },
  
  async hasRequiredFields(profileId: number): Promise<boolean> {
    try {
      const profile = await this.getProfessionalProfileById(profileId);
      
      if (!profile) return false;
      
      // Vérifier si les champs obligatoires pour les factures sont présents
      return (
        !!profile.adeli_number && 
        !!profile.siret && 
        !!profile.name && 
        !!profile.title
      );
    } catch (error) {
      console.error("Erreur lors de la vérification des champs obligatoires:", error);
      return false;
    }
  }
};
