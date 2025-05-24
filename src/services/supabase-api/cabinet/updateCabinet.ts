
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CabinetUpdateInput } from "./types";

export async function updateCabinet(id: number, cabinet: CabinetUpdateInput): Promise<Cabinet> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Appeler la fonction Edge sécurisée
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet?id=${id}`, {
      method: 'PATCH',
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
    console.error("Erreur updateCabinet:", error);
    throw error;
  }
}
