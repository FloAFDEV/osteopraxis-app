
import { Cabinet } from "@/types";
import { getCabinets } from "./getCabinets";

export async function getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
  try {
    console.log("Searching for cabinets for userId:", userId);
    
    if (!userId) {
      console.log("Invalid userId provided to getCabinetsByUserId");
      return [];
    }
    
    // Utiliser la fonction Edge qui filtre automatiquement par utilisateur connecté
    return await getCabinets();
  } catch (error) {
    console.error("Exception while searching for cabinets:", error);
    throw error;
  }
}
