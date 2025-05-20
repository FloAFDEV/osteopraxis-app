
import { supabase } from "../utils";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function deletePatient(id: number): Promise<{ error: any | null }> {
  try {
    // Récupérer l'ID de l'ostéopathe connecté
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.error("Impossible de supprimer un patient: aucun ostéopathe connecté");
      return { error: new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe") };
    }
    
    // Vérifier d'abord que le patient appartient bien à l'ostéopathe connecté
    const { data: patient, error: checkError } = await supabase
      .from("Patient")
      .select("id, osteopathId")
      .eq("id", id)
      .maybeSingle();
      
    if (checkError) {
      console.error("Erreur lors de la vérification du patient:", checkError);
      return { error: checkError };
    }
    
    // SÉCURITÉ RENFORCÉE: Vérifier si le patient existe mais appartient à un autre ostéopathe
    if (patient && patient.osteopathId !== osteopathId) {
      console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: L'ostéopathe ${osteopathId} a tenté de supprimer le patient ${id} appartenant à l'ostéopathe ${patient.osteopathId}`);
      return { error: new Error("Accès non autorisé: ce patient n'est pas associé à votre compte") };
    }
    
    if (!patient) {
      console.error(`Patient avec ID ${id} non trouvé ou n'appartient pas à l'ostéopathe ${osteopathId}`);
      return { error: new Error("Patient non trouvé ou accès non autorisé") };
    }
    
    // Si le patient appartient bien à l'ostéopathe, procéder à la suppression
    const { error } = await supabase.from("Patient").delete().eq("id", id);
    
    if (error) {
      console.error(`Erreur lors de la suppression du patient ${id}:`, error);
    } else {
      console.log(`Patient ${id} supprimé avec succès par l'ostéopathe ${osteopathId}`);
    }
    
    return { error: error || null };
  } catch (error) {
    console.error("Exception while deleting patient:", error);
    return { error };
  }
}
