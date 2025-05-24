
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinets(): Promise<Cabinet[]> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("Aucune session active lors de la récupération des cabinets");
      return [];
    }

    // Appeler la fonction Edge sécurisée
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data || [];
  } catch (error) {
    console.error("Erreur getCabinets:", error);
    throw error;
  }
}
