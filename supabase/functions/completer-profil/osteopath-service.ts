
import { createAdminClient } from './utils.ts';

/**
 * Ensures that the user exists in the custom User table
 */
export async function ensureUserExists(authUser: any) {
  const adminClient = createAdminClient();
  
  console.log("Vérification de l'existence de l'utilisateur dans la table User:", authUser.id);
  
  try {
    // Vérifier si l'utilisateur existe déjà dans la table User
    const { data: existingUser, error: findError } = await adminClient
      .from('User')
      .select('*')
      .eq('auth_id', authUser.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Erreur lors de la recherche d'un utilisateur:", findError);
      throw new Error(`Erreur lors de la recherche d'un utilisateur: ${findError.message}`);
    }
    
    // Si l'utilisateur n'existe pas, le créer
    if (!existingUser) {
      console.log("L'utilisateur n'existe pas dans la table User, création...");
      
      const { error: insertError } = await adminClient
        .from('User')
        .insert({
          id: authUser.id, // Use as primary key
          auth_id: authUser.id, // Link to Supabase Auth
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name || "",
          last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.family_name || "",
          role: "OSTEOPATH",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error("Erreur lors de l'insertion de l'utilisateur:", insertError);
        throw new Error(`Erreur lors de la création de l'utilisateur: ${insertError.message}`);
      }
      
      console.log("Utilisateur créé avec succès dans la table User");
    } else {
      console.log("Utilisateur existant trouvé dans la table User:", existingUser.id);
    }
    
    return true;
  } catch (error) {
    console.error("Exception dans ensureUserExists:", error);
    throw error;
  }
}

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
    // Mise à jour de l'utilisateur dans la table User personnalisée
    // en utilisant auth_id plutôt que id pour correspondre à l'id de l'Auth Supabase
    const { error: userUpdateError } = await adminClient
      .from('User')
      .update({ osteopathId: osteopathId })
      .eq('auth_id', userId);
      
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
