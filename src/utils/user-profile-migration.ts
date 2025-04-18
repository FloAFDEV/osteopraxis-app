
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Utilitaire pour migrer les données utilisateur de osteopathId vers professionalProfileId
 */
export async function migrateUserProfiles() {
  try {
    console.log("Début de la migration des profils utilisateurs...");
    
    // Récupérer tous les utilisateurs qui ont un osteopathId mais pas de professionalProfileId
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, osteopathId, professionalProfileId')
      .is('professionalProfileId', null)
      .not('osteopathId', 'is', null);
    
    if (usersError) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${usersError.message}`);
    }
    
    console.log(`${users?.length || 0} utilisateurs à migrer`);
    
    // Compteurs
    let migrated = 0;
    let errors = 0;
    
    // Mettre à jour chaque utilisateur
    for (const user of users || []) {
      try {
        const { error: updateError } = await supabase
          .from('User')
          .update({ professionalProfileId: user.osteopathId })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`Erreur lors de la mise à jour de l'utilisateur ${user.id}:`, updateError);
          errors++;
        } else {
          migrated++;
        }
      } catch (err) {
        console.error(`Exception lors de la mise à jour de l'utilisateur ${user.id}:`, err);
        errors++;
      }
    }
    
    console.log(`Migration terminée: ${migrated} utilisateurs migrés, ${errors} erreurs.`);
    return { migrated, errors };
    
  } catch (error) {
    console.error("Erreur globale lors de la migration des utilisateurs:", error);
    toast.error("Une erreur est survenue pendant la migration des utilisateurs");
    return { migrated: 0, errors: -1 };
  }
}

/**
 * Utilitaire pour vérifier la cohérence des données après migration
 */
export async function verifyUserProfileMigration() {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, osteopathId, professionalProfileId')
      .not('osteopathId', 'is', null)
      .is('professionalProfileId', null);
    
    if (error) {
      throw new Error(`Erreur lors de la vérification: ${error.message}`);
    }
    
    return {
      success: true,
      usersWithoutProfile: data?.length || 0,
      message: data?.length 
        ? `${data.length} utilisateurs n'ont pas encore de professionalProfileId.`
        : "Tous les utilisateurs avec osteopathId ont maintenant un professionalProfileId."
    };
    
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return { 
      success: false, 
      usersWithoutProfile: -1,
      message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`
    };
  }
}
