
import { supabase } from "../utils";
import { ensureOsteopathProfile } from "./ensureOsteopathProfile";

/**
 * Récupère l'ID de l'ostéopathe actuellement connecté
 * Si aucun profil Ostéopathe n'est trouvé, en crée un
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Erreur: Utilisateur non connecté", userError);
      return null;
    }
    
    // Utiliser ensureOsteopathProfile pour garantir l'existence du profil
    return await ensureOsteopathProfile(user.id);
    
  } catch (error) {
    console.error("Erreur inattendue dans getCurrentOsteopathId:", error);
    return null;
  }
};

/**
 * Vérifie si l'ostéopathe donné correspond à l'utilisateur connecté
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
