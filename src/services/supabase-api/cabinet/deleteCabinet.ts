
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";
import { getCabinetById } from "./getCabinetById";

export async function deleteCabinet(id: number): Promise<void> {
  try {
    // Vérifier que l'utilisateur est autorisé à supprimer ce cabinet
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
    }
    
    // Vérifier que le cabinet appartient bien à l'ostéopathe connecté
    const existingCabinet = await getCabinetById(id);
    
    if (!existingCabinet) {
      throw new Error("Cabinet non trouvé ou accès non autorisé");
    }
    
    if (existingCabinet.osteopathId !== currentOsteopathId) {
      console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: L'ostéopathe ${currentOsteopathId} tente de supprimer le cabinet ${id} appartenant à l'ostéopathe ${existingCabinet.osteopathId}`);
      throw new Error("Accès non autorisé: ce cabinet n'est pas associé à votre compte");
    }
    
    console.log(`Suppression du cabinet ${id} pour l'ostéopathe ${currentOsteopathId}`);
    
    const { error } = await supabase
      .from("Cabinet")
      .delete()
      .eq("id", id)
      .eq("osteopathId", currentOsteopathId); // Filtrer par ostéopathe connecté
      
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Erreur lors de la suppression du cabinet:", error);
    throw error;
  }
}
