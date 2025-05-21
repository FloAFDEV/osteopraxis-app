
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
      console.error("[SECURITY] Erreur ou session non trouvée:", sessionError || "Pas de session active");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error("[SECURITY] User ID non disponible dans la session");
      return null;
    }
    
    console.log("[SECURITY] Recherche de l'osteopathId pour userId:", userId);
    
    // 2. Rechercher d'abord dans la table User pour obtenir l'osteopathId
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId, email, first_name, last_name")
      .eq("id", userId)
      .maybeSingle();
      
    if (userError) {
      console.error("[SECURITY] Erreur lors de la recherche de l'utilisateur:", userError);
    }
    
    // Si l'osteopathId est présent dans User, le retourner directement
    if (userData?.osteopathId) {
      console.log("[SECURITY] OsteopathId trouvé dans User:", userData.osteopathId, "pour", userData.email, userData.first_name, userData.last_name);
      return userData.osteopathId;
    }
    
    // 3. Sinon, rechercher dans la table Osteopath par userId
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id, name, userId")
      .eq("userId", userId)
      .maybeSingle();
      
    if (osteopathError) {
      console.error("[SECURITY] Erreur lors de la recherche de l'ostéopathe:", osteopathError);
      return null;
    }
    
    if (!osteopathData) {
      console.log("[SECURITY] Aucun profil ostéopathe trouvé pour userId:", userId);
      return null;
    }
    
    console.log("[SECURITY] OsteopathId trouvé dans Osteopath:", osteopathData.id, "pour", osteopathData.name);
    
    // 4. Mettre à jour la table User avec l'osteopathId pour les futures requêtes
    if (osteopathData.id) {
      try {
        const { error: updateError } = await supabase
          .from("User")
          .update({ osteopathId: osteopathData.id })
          .eq("id", userId);
          
        if (updateError) {
          console.error("[SECURITY] Erreur lors de la mise à jour de l'utilisateur avec osteopathId:", updateError);
        } else {
          console.log("[SECURITY] User mis à jour avec osteopathId:", osteopathData.id);
        }
      } catch (updateError) {
        console.error("[SECURITY] Exception lors de la mise à jour de l'utilisateur:", updateError);
      }
    }
    
    return osteopathData.id;
  } catch (error) {
    console.error("[SECURITY] Erreur inattendue dans getCurrentOsteopathId:", error);
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
    const result = currentOsteopathId === osteopathId;
    if (!result) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès à l'ostéopathe ${osteopathId} par l'ostéopathe ${currentOsteopathId}`);
    }
    return result;
  } catch (error) {
    console.error("[SECURITY] Erreur lors de la vérification de l'ostéopathe:", error);
    return false;
  }
};

// Ré-exporter les fonctions de vérification de propriété depuis le fichier dédié
export { 
  isPatientOwnedByCurrentOsteopath,
  isCabinetOwnedByCurrentOsteopath,
  isAppointmentOwnedByCurrentOsteopath,
  isInvoiceOwnedByCurrentOsteopath
} from './security/ownershipChecks';
