
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getCabinets(): Promise<Cabinet[]> {
  try {
    // Récupérer l'ID de l'ostéopathe connecté pour assurer le cloisonnement
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("Aucun ostéopathe connecté lors de la récupération des cabinets");
      return [];
    }
    
    console.log(`Récupération des cabinets pour l'ostéopathe ${osteopathId}`);
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathId); // Important: filtrer par ostéopathe connecté
      
    if (error) {
      console.error("Erreur lors de la récupération des cabinets:", error);
      throw new Error(error.message);
    }
    
    console.log(`${data?.length || 0} cabinet(s) trouvé(s) pour l'ostéopathe ${osteopathId}`);
    return (data || []) as Cabinet[];
  } catch (error) {
    console.error("Exception lors de la récupération des cabinets:", error);
    throw error;
  }
}
