
import { api } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Utilitaire pour migrer les patients de osteopathId vers professionalProfileId
 */
export async function migratePatients() {
  try {
    console.log("Début de la migration des patients...");
    
    // Récupérer tous les patients
    const { data: patients, error: fetchError } = await supabase
      .from('Patient')
      .select('id, osteopathId, professionalProfileId');
    
    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des patients: ${fetchError.message}`);
    }
    
    // Filtrer les patients qui ont un osteopathId mais pas de professionalProfileId
    const patientsToMigrate = patients?.filter(
      p => p.osteopathId && !p.professionalProfileId
    );
    
    if (!patientsToMigrate || patientsToMigrate.length === 0) {
      console.log("Aucun patient à migrer.");
      return { migrated: 0, errors: 0 };
    }
    
    console.log(`${patientsToMigrate.length} patients à migrer.`);
    
    // Compteurs
    let migrated = 0;
    let errors = 0;
    
    // Mettre à jour chaque patient
    for (const patient of patientsToMigrate) {
      try {
        // Nous utilisons le même ID puisque ProfessionalProfile contient les mêmes données que Osteopath
        const { error: updateError } = await supabase
          .from('Patient')
          .update({ professionalProfileId: patient.osteopathId })
          .eq('id', patient.id);
        
        if (updateError) {
          console.error(`Erreur lors de la mise à jour du patient ${patient.id}:`, updateError);
          errors++;
        } else {
          migrated++;
        }
      } catch (err) {
        console.error(`Exception lors de la mise à jour du patient ${patient.id}:`, err);
        errors++;
      }
    }
    
    console.log(`Migration terminée: ${migrated} patients migrés, ${errors} erreurs.`);
    return { migrated, errors };
    
  } catch (error) {
    console.error("Erreur globale lors de la migration:", error);
    toast.error("Une erreur est survenue pendant la migration des patients");
    return { migrated: 0, errors: -1 };
  }
}

/**
 * Utilitaire pour vérifier la cohérence des données après migration
 */
export async function verifyMigration() {
  try {
    const { data, error } = await supabase
      .from('Patient')
      .select('id, osteopathId, professionalProfileId')
      .is('professionalProfileId', null);
    
    if (error) {
      throw new Error(`Erreur lors de la vérification: ${error.message}`);
    }
    
    return {
      success: true,
      patientsWithoutProfile: data?.length || 0,
      message: data?.length 
        ? `${data.length} patients n'ont pas encore de professionalProfileId.`
        : "Tous les patients ont un professionalProfileId."
    };
    
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return { 
      success: false, 
      patientsWithoutProfile: -1,
      message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`
    };
  }
}
