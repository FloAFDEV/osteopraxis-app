
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
  try {
    if (!osteopathId) {
      console.log("Invalid osteopathId provided to getCabinetsByOsteopathId");
      return [];
    }
    
    // Utiliser la fonction Edge qui filtre automatiquement par ostéopathe connecté
    return await getCabinets();
  } catch (error) {
    console.error("Exception lors de la récupération des cabinets par osteopathId:", error);
    throw error;
  }
}

// Import de la fonction getCabinets mise à jour
import { getCabinets } from "./getCabinets";
