
import { ProfessionalProfile } from "@/types";
import { supabase, typedData } from "./utils";

export const supabaseProfessionalProfileService = {
  async getProfessionalProfiles(): Promise<ProfessionalProfile[]> {
    const { data, error } = await supabase
      .from("ProfessionalProfile")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return typedData<ProfessionalProfile[]>(data);
  },

  async getProfessionalProfileById(id: number): Promise<ProfessionalProfile | undefined> {
    const { data, error } = await supabase
      .from("ProfessionalProfile")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        console.log("Profil professionnel non trouvé avec l'ID:", id);
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return typedData<ProfessionalProfile>(data);
  },
  
  async getProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | undefined> {
    console.log("Recherche d'un profil professionnel avec l'userId:", userId);
    
    if (!userId) {
      console.log("UserId invalide fourni à getProfessionalProfileByUserId");
      throw new Error("UserId invalide fourni");
    }
    
    try {
      // Vérifier l'état de la session avant d'exécuter la requête
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("État de la session:", sessionData.session ? "Authentifié" : "Non authentifié");
      
      if (!sessionData.session) {
        console.log("Utilisateur non authentifié, impossible de récupérer le profil");
        throw new Error("Utilisateur non authentifié");
      }
      
      console.log("ID utilisateur de la session:", sessionData.session.user.id);
      console.log("ID utilisateur passé en paramètre:", userId);
      console.log("Exécution de la requête avec userId:", userId);
      
      // Recherche exacte avec le userId
      const { data, error } = await supabase
        .from("ProfessionalProfile")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();
        
      if (error) {
        console.error("Erreur lors de la recherche du profil professionnel:", error);
        throw new Error(error.message);
      }
      
      if (!data) {
        console.log("Aucun profil professionnel trouvé avec l'userId:", userId);
        
        // Afficher les profils existants pour le débogage
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from("ProfessionalProfile")
          .select("id, userId")
          .limit(5);
          
        if (!allProfilesError && allProfiles) {
          console.log("Voici les 5 premiers profils dans la base:", allProfiles);
        }
        
        return undefined;
      }
      
      console.log("Profil professionnel trouvé:", data);
      return typedData<ProfessionalProfile>(data);
    } catch (error) {
      console.error("Exception lors de la recherche du profil professionnel:", error);
      throw error;
    }
  },
  
  async updateProfessionalProfile(id: number, data: Partial<Omit<ProfessionalProfile, 'id' | 'createdAt'>>): Promise<ProfessionalProfile | undefined> {
    try {
      console.log(`Mise à jour du profil professionnel ID ${id} avec les données:`, data);
      const { data: updatedProfile, error } = await supabase
        .from("ProfessionalProfile")
        .update(data)
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      console.log("Profil professionnel mis à jour avec succès:", updatedProfile);
      return typedData<ProfessionalProfile>(updatedProfile);
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
      return newProfile;
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

// Export pour compatibilité avec le code existant
export const supabaseOsteopathService = supabaseProfessionalProfileService;
