
import { Cabinet } from "@/types";
import { getCabinets } from "./getCabinets";

export async function getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
  try {
    // ✅ Recherche cabinets utilisateur
    
    if (!userId) {
      // ✅ UserId invalide
      return [];
    }
    
    // Utiliser la fonction Edge qui filtre automatiquement par utilisateur connecté
    return await getCabinets();
  } catch (error) {
    console.error("Exception while searching for cabinets:", error);
    throw error;
  }
}
