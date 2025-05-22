
import { createAdminClient } from './utils.ts';

/**
 * Finds an osteopath by user ID
 */
export async function findOsteopathByUserId(userId: string) {
  const adminClient = createAdminClient();
  
  console.log("Recherche d'un ostéopathe existant pour l'utilisateur:", userId);
  
  try {
    // Vérifier que l'accès à la base fonctionne avec une requête simple
    const { data: testAccess, error: testError } = await adminClient
      .from('Osteopath')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error("Test d'accès à la base échoué:", testError);
      throw new Error(`Erreur d'accès administrateur: ${testError.message}`);
    }
    
    console.log("Accès à la base confirmé, recherche de l'ostéopathe...");
    
    // Rechercher l'ostéopathe par userId
    const { data: existingOsteopath, error: findError } = await adminClient
      .from('Osteopath')
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
      
    if (findError) {
      console.error("Erreur lors de la recherche d'un ostéopathe:", findError);
      throw new Error(`Erreur lors de la recherche d'un ostéopathe: ${findError.message}`);
    }
    
    return existingOsteopath;
  } catch (error) {
    console.error("Exception dans findOsteopathByUserId:", error);
    throw error;
  }
}

/**
 * Updates an existing osteopath
 */
export async function updateOsteopath(id: number, osteopathData: any, existingData: any) {
  const adminClient = createAdminClient();
  
  console.log("Mise à jour de l'ostéopathe:", id);
  
  // Ne pas écraser les champs existants si vides
  const updatedData = { ...osteopathData };
  Object.keys(updatedData).forEach(key => {
    if (updatedData[key] === null && existingData[key]) {
      updatedData[key] = existingData[key];
    }
  });
  
  try {
    const { data: updatedOsteopath, error: updateError } = await adminClient
      .from('Osteopath')
      .update({
        ...updatedData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      console.error("Erreur lors de la mise à jour de l'ostéopathe:", updateError);
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }
    
    return updatedOsteopath;
  } catch (error) {
    console.error("Exception dans updateOsteopath:", error);
    throw error;
  }
}

/**
 * Creates a new osteopath
 */
export async function createOsteopath(userId: string, osteopathData: any) {
  const adminClient = createAdminClient();
  
  console.log("Création d'un nouvel ostéopathe pour l'utilisateur:", userId);
  
  const now = new Date().toISOString();
  
  // S'assurer que nous avons les données minimales requises
  const osteopathToCreate = {
    name: osteopathData.name || "Ostéopathe",
    professional_title: osteopathData.professional_title || "Ostéopathe D.O.",
    adeli_number: osteopathData.adeli_number || null,
    siret: osteopathData.siret || null,
    ape_code: osteopathData.ape_code || "8690F",
    userId: userId,
    createdAt: now,
    updatedAt: now
  };
  
  try {
    console.log("Tentative d'insertion avec:", osteopathToCreate);
    
    const { data: newOsteopath, error: insertError } = await adminClient
      .from('Osteopath')
      .insert(osteopathToCreate)
      .select()
      .single();
      
    if (insertError) {
      console.error("Erreur lors de l'insertion de l'ostéopathe:", insertError);
      throw new Error(`Erreur lors de la création: ${insertError.message}`);
    }
      
    return newOsteopath;
  } catch (error) {
    console.error("Exception dans createOsteopath:", error);
    throw error;
  }
}

/**
 * Updates the user profile with the osteopath ID
 */
export async function updateUserWithOsteopathId(userId: string, osteopathId: number) {
  const adminClient = createAdminClient();
  
  console.log("Mise à jour du profil utilisateur avec l'ID de l'ostéopathe:", osteopathId);
  
  try {
    const { error: userUpdateError } = await adminClient
      .from('User')
      .update({ osteopathId: osteopathId })
      .eq('id', userId);
      
    if (userUpdateError) {
      console.error("Erreur lors de la mise à jour du profil utilisateur:", userUpdateError);
      throw new Error(`Erreur lors de la mise à jour du profil: ${userUpdateError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Exception dans updateUserWithOsteopathId:", error);
    throw error;
  }
}
