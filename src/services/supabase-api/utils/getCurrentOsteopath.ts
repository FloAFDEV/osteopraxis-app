
import { supabase } from "../utils";

/**
 * Récupère l'ID de l'ostéopathe connecté à partir de son userId
 * @returns L'ID de l'ostéopathe ou une erreur si non trouvé
 */
export async function getCurrentOsteopathId(): Promise<number> {
  // 1. Récupérer l'utilisateur connecté
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("Erreur d'authentification:", authError);
    throw new Error("Utilisateur non connecté");
  }
  
  // 2. Récupérer l'ostéopathe lié à cet utilisateur
  const { data, error } = await supabase
    .from("Osteopath")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la récupération de l'ostéopathe:", error);
    throw error;
  }
  
  if (!data) {
    console.error("Aucun ostéopathe trouvé pour l'utilisateur:", user.id);
    throw new Error("Profil ostéopathe introuvable pour cet utilisateur");
  }
  
  return data.id as number;
}

/**
 * Vérifie si deux ostéopathes sont le même (pour vérifications de sécurité)
 * @param osteoId1 Premier ID d'ostéopathe
 * @param osteoId2 Second ID d'ostéopathe
 * @returns true si les IDs correspondent
 */
export function isSameOsteopath(osteoId1: number, osteoId2: number): boolean {
  return osteoId1 === osteoId2;
}
