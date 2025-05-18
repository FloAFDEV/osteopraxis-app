
import { supabase } from "../utils";

/**
 * Vérifie si un profil Ostéopathe existe pour l'utilisateur et en crée un si nécessaire
 * @param userId L'ID de l'utilisateur authentifié
 * @returns L'ID de l'ostéopathe créé ou existant
 */
export async function ensureOsteopathProfile(userId: string): Promise<number> {
  console.log("Vérification/création du profil Ostéopathe pour userId:", userId);
  
  if (!userId) {
    console.error("Impossible de créer un profil ostéopathe: userId invalide");
    throw new Error("UserID invalide");
  }

  try {
    // Vérifier si un profil Ostéopathe existe déjà
    const { data: existingProfile, error: checkError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erreur lors de la vérification du profil Ostéopathe:", checkError);
      throw checkError;
    }

    // Si le profil existe, retourner son ID
    if (existingProfile) {
      console.log("Profil Ostéopathe existant trouvé:", existingProfile.id);
      return existingProfile.id;
    }

    // Créer un nouveau profil Ostéopathe
    console.log("Création d'un nouveau profil Ostéopathe pour userId:", userId);
    const now = new Date().toISOString();
    
    // Récupérer les informations de l'utilisateur pour obtenir son nom
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    let userName = "Ostéopathe";
    if (userData && !userError) {
      userName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Ostéopathe";
    }

    const { data: newProfile, error: insertError } = await supabase
      .from("Osteopath")
      .insert({
        userId,
        name: userName,
        professional_title: "Ostéopathe D.O.",
        ape_code: "8690F",
        createdAt: now,
        updatedAt: now,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Erreur lors de la création du profil Ostéopathe:", insertError);
      throw insertError;
    }

    console.log("Nouveau profil Ostéopathe créé avec succès:", newProfile.id);
    return newProfile.id;
  } catch (error) {
    console.error("Erreur dans ensureOsteopathProfile:", error);
    throw error;
  }
}
