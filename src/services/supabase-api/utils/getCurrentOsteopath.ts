
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère l'ID de l'ostéopathe associé à l'utilisateur connecté
 * @returns L'ID de l'ostéopathe ou null si non trouvé
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
  try {
    // 1. Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("Erreur ou session non trouvée:", sessionError || "Pas de session active");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error("User ID non disponible dans la session");
      return null;
    }
    
    console.log("Recherche de l'osteopathId pour userId:", userId);
    
    // 2. Rechercher d'abord dans la table User pour obtenir l'osteopathId
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("id", userId)
      .maybeSingle();
      
    if (userError) {
      console.error("Erreur lors de la recherche de l'utilisateur:", userError);
    }
    
    // Si l'osteopathId est présent dans User, le retourner directement
    if (userData?.osteopathId) {
      console.log("OsteopathId trouvé dans User:", userData.osteopathId);
      return userData.osteopathId;
    }
    
    // 3. Sinon, rechercher dans la table Osteopath par userId
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();
      
    if (osteopathError) {
      console.error("Erreur lors de la recherche de l'ostéopathe:", osteopathError);
      return null;
    }
    
    if (!osteopathData) {
      console.log("Aucun profil ostéopathe trouvé pour userId:", userId);
      return null;
    }
    
    console.log("OsteopathId trouvé dans Osteopath:", osteopathData.id);
    
    // 4. Mettre à jour la table User avec l'osteopathId pour les futures requêtes
    if (osteopathData.id) {
      try {
        const { error: updateError } = await supabase
          .from("User")
          .update({ osteopathId: osteopathData.id })
          .eq("id", userId);
          
        if (updateError) {
          console.error("Erreur lors de la mise à jour de l'utilisateur avec osteopathId:", updateError);
        } else {
          console.log("User mis à jour avec osteopathId:", osteopathData.id);
        }
      } catch (updateError) {
        console.error("Exception lors de la mise à jour de l'utilisateur:", updateError);
      }
    }
    
    return osteopathData.id;
  } catch (error) {
    console.error("Erreur inattendue dans getCurrentOsteopathId:", error);
    return null;
  }
};

/**
 * Vérifie si l'ostéopathe spécifié est celui connecté
 * @param osteopathId ID de l'ostéopathe à vérifier
 * @returns true si c'est l'ostéopathe connecté, false sinon
 */
export const isSameOsteopath = async (osteopathId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    return currentOsteopathId === osteopathId;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'ostéopathe:", error);
    return false;
  }
};

/**
 * Vérifie si un patient appartient à l'ostéopathe connecté
 * @param patientId ID du patient à vérifier
 * @returns true si le patient appartient à l'ostéopathe connecté, false sinon
 */
export const isPatientOwnedByCurrentOsteopath = async (patientId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("Tentative de vérification de propriété d'un patient sans osteopathId");
      return false;
    }
    
    const { data, error } = await supabase
      .from("Patient")
      .select("id")
      .eq("id", patientId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();
      
    if (error) {
      console.error(`Erreur lors de la vérification du patient ${patientId}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Erreur lors de la vérification de propriété du patient ${patientId}:`, error);
    return false;
  }
};

/**
 * Vérifie si un cabinet appartient à l'ostéopathe connecté
 * @param cabinetId ID du cabinet à vérifier
 * @returns true si le cabinet appartient à l'ostéopathe connecté, false sinon
 */
export const isCabinetOwnedByCurrentOsteopath = async (cabinetId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("Tentative de vérification de propriété d'un cabinet sans osteopathId");
      return false;
    }
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("id")
      .eq("id", cabinetId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();
      
    if (error) {
      console.error(`Erreur lors de la vérification du cabinet ${cabinetId}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Erreur lors de la vérification de propriété du cabinet ${cabinetId}:`, error);
    return false;
  }
};
