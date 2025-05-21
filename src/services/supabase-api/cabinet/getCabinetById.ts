
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getCabinetById(id: number): Promise<Cabinet | undefined> {
  try {
    // Récupérer l'ID de l'ostéopathe connecté
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("Tentative de récupération d'un cabinet sans être connecté");
      return undefined;
    }
    
    console.log(`Récupération du cabinet ${id} pour l'ostéopathe ${osteopathId}`);
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId) // Important: filtrer par ostéopathe connecté
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        // Vérifier si le cabinet existe mais appartient à un autre ostéopathe
        const { data: anyCabinet } = await supabase
          .from("Cabinet")
          .select("id")
          .eq("id", id)
          .maybeSingle();
          
        if (anyCabinet) {
          console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: L'ostéopathe ${osteopathId} a tenté d'accéder au cabinet ${id} qui ne lui appartient pas`);
        }
        
        console.log(`Cabinet ${id} non trouvé pour l'ostéopathe ${osteopathId}`);
        return undefined;
      }
      console.error(`Erreur lors de la récupération du cabinet ${id}:`, error);
      throw new Error(error.message);
    }
    
    return data as Cabinet;
  } catch (error) {
    console.error(`Exception lors de la récupération du cabinet ${id}:`, error);
    throw error;
  }
}
