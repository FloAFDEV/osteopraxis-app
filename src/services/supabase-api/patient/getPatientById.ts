
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    // Vérifier que l'ID est valide
    if (!id || isNaN(id) || id <= 0) {
      console.error("ID patient invalide:", id);
      return null;
    }

    // Récupérer l'ID de l'ostéopathe connecté
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.error("Impossible de récupérer un patient: aucun ostéopathe connecté");
      throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
    }
    
    console.log(`Récupération du patient ${id} pour l'ostéopathe ${osteopathId}`);
    
    // Utiliser maybeSingle() et filtrer par osteopathId pour sécuriser l'accès
    const { data, error } = await supabase
      .from("Patient")
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching patient with id ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      // SÉCURITÉ RENFORCÉE: Vérifier si le patient existe mais appartient à un autre ostéopathe
      const { data: anyPatient } = await supabase
        .from("Patient")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      
      if (anyPatient) {
        console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: L'ostéopathe ${osteopathId} a tenté d'accéder au patient ${id} qui ne lui appartient pas`);
        throw new Error("Accès non autorisé: ce patient n'est pas associé à votre compte");
      }
      
      console.log(`Aucun patient trouvé avec l'ID ${id} pour l'ostéopathe ${osteopathId}`);
      return null;
    }
    
    return adaptPatientFromSupabase(data);
  } catch (error) {
    console.error(`Error in getPatientById:`, error);
    throw error;
  }
}
