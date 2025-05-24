
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CabinetCreateInput } from "./types";

export async function createCabinet(cabinet: CabinetCreateInput): Promise<Cabinet> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Appeler la fonction Edge sécurisée
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(cabinet)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data;
  } catch (error) {
    console.error("Erreur createCabinet:", error);
    throw error;
  }
}
