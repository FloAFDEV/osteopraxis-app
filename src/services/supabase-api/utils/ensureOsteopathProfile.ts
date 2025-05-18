
import { supabase } from "../utils";

/**
 * Vérifie si un profil Ostéopathe existe pour l'utilisateur donné, 
 * en crée un si nécessaire, et retourne l'ID du profil Ostéopathe
 */
export const ensureOsteopathProfile = async (userId: string): Promise<number | null> => {
  try {
    console.log("Vérification du profil ostéopathe pour userId:", userId);
    
    // Vérifier si un profil existe déjà
    const { data: existingProfile, error: checkError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();
      
    // Si un profil existe, retourner son ID
    if (existingProfile) {
      console.log("Profil ostéopathe existant trouvé:", existingProfile.id);
      
      // Mettre à jour la référence dans User au cas où elle ne serait pas définie
      const { error: updateError } = await supabase
        .from("User")
        .update({ osteopathId: existingProfile.id })
        .eq("id", userId)
        .is("osteopathId", null);
        
      if (updateError) {
        console.error("Erreur lors de la mise à jour de la référence osteopathId dans User:", updateError);
      }
      
      return existingProfile.id;
    }
    
    // Si une erreur autre qu'une absence de résultat survient
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Erreur lors de la vérification du profil ostéopathe:", checkError);
      throw new Error(`Erreur lors de la vérification du profil ostéopathe: ${checkError.message}`);
    }
    
    // Récupérer les informations de l'utilisateur pour le nom
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("first_name, last_name")
      .eq("id", userId)
      .maybeSingle();
      
    let name = "Nouvel Ostéopathe";
    if (userData && !userError) {
      name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      if (!name) name = "Nouvel Ostéopathe";
    }
    
    // Créer un nouveau profil Ostéopathe
    const { data: newProfile, error: insertError } = await supabase
      .from("Osteopath")
      .insert({
        userId,
        name,
        professional_title: "Ostéopathe D.O.",
        adeli_number: null,
        siret: null,
        ape_code: "8690F",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error("Erreur lors de la création du profil ostéopathe:", insertError);
      throw new Error(`Erreur lors de la création du profil ostéopathe: ${insertError.message}`);
    }
    
    console.log("Nouveau profil ostéopathe créé avec ID:", newProfile.id);
    
    // Notre trigger SQL devrait automatiquement mettre à jour la référence dans la table User
    
    return newProfile.id;
    
  } catch (error) {
    console.error("Erreur inattendue dans ensureOsteopathProfile:", error);
    throw error;
  }
};
