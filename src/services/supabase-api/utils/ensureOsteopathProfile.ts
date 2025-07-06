
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie et crée un profil d'ostéopathe pour l'utilisateur si nécessaire
 * @param userId ID de l'utilisateur connecté
 * @param userData Données optionnelles pour créer le profil (nom, prénom)
 * @returns L'ID du profil ostéopathe (existant ou nouveau)
 * @deprecated Cette fonction n'est plus utilisée car nous laissons maintenant l'utilisateur créer son profil lui-même
 */
export const ensureOsteopathProfile = async (
  userId: string,
  userData?: { first_name?: string; last_name?: string }
): Promise<number | null> => {
  try {
    console.log("Cette fonction est dépréciée et sera supprimée dans une future version");
    
    // Recherche d'un profil ostéopathe existant
    const { data: existingOsteopath, error: searchError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();
    
    if (searchError) {
      console.error("Erreur lors de la recherche du profil ostéopathe:", searchError);
      return null;
    }
    
    // Si un profil existe déjà, retourner son ID
    if (existingOsteopath) {
      console.log("Profil ostéopathe existant trouvé:", existingOsteopath.id);
      return existingOsteopath.id;
    }
    
    // Dans la nouvelle logique, nous ne créons plus automatiquement de profil
    // L'utilisateur doit le faire lui-même via le formulaire de configuration
    // ✅ Profil ostéopathe à créer via formulaire
    
    return null;
  } catch (error) {
    console.error("Erreur inattendue dans ensureOsteopathProfile:", error);
    return null;
  }
};
