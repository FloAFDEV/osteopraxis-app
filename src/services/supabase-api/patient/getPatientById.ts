
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    // Récupérer l'ID de l'ostéopathe connecté
    const osteopathId = await getCurrentOsteopathId();
    
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
      console.log(`Aucun patient trouvé avec l'ID ${id} pour l'ostéopathe ${osteopathId}`);
      return null;
    }
    
    return adaptPatientFromSupabase(data);
  } catch (error) {
    console.error(`Error in getPatientById:`, error);
    throw error;
  }
}
