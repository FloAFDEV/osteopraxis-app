
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";
import { getCabinetById } from "./getCabinetById";

export async function updateTimestamps(cabinetId: number): Promise<void> {
  try {
    // Vérifier que l'utilisateur est autorisé à modifier ce cabinet
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
    }
    
    // Vérifier que le cabinet appartient bien à l'ostéopathe connecté
    const existingCabinet = await getCabinetById(cabinetId);
    
    if (!existingCabinet) {
      throw new Error("Cabinet non trouvé ou accès non autorisé");
    }
    
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from("Cabinet")
      .update({ 
        updatedAt: now 
      })
      .eq("id", cabinetId)
      .eq("osteopathId", currentOsteopathId); // Filtrer par ostéopathe connecté
      
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des timestamps:", error);
    throw error;
  }
}
