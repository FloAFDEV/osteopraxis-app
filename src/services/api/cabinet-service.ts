
import { Cabinet } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";

// Mock data pour les tests locaux
const mockCabinets: Cabinet[] = [
  {
    id: 1,
    name: "Cabinet Principal",
    address: "123 Rue de la Santé, 75001 Paris",
    phone: "01 23 45 67 89",
    email: "contact@cabinet.fr",
    osteopathId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const cabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    if (USE_SUPABASE) {
      try {
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'ID de l'ostéopathe connecté");
        }

        // Pour l'instant, on utilise l'API Supabase basique
        // À adapter selon votre implémentation Supabase existante
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("Cabinet")
          .select("*")
          .eq("osteopathId", osteopathId);

        if (error) {
          console.error("Erreur lors de la récupération des cabinets:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Erreur Supabase getCabinets:", error);
        throw error;
      }
    }

    // Simulation locale
    await delay(200);
    return mockCabinets;
  },
};
