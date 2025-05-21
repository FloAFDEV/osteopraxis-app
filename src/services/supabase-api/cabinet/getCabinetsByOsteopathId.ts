
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
  try {
    if (!osteopathId) {
      console.log("Invalid osteopathId provided to getCabinetsByOsteopathId");
      return [];
    }
    
    // Vérifier si l'ostéopathe demandé est bien celui connecté
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (currentOsteopathId !== osteopathId) {
      console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: L'ostéopathe ${currentOsteopathId} a tenté d'accéder aux cabinets de l'ostéopathe ${osteopathId}`);
      return [];
    }
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathId);
      
    if (error) throw new Error(error.message);
    
    return (data || []) as Cabinet[];
  } catch (error) {
    console.error("Exception lors de la récupération des cabinets par osteopathId:", error);
    throw error;
  }
}
