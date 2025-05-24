
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinetById(id: number): Promise<Cabinet | undefined> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("Tentative de récupération d'un cabinet sans être connecté");
      return undefined;
    }

    // Appeler la fonction Edge sécurisée
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data;
  } catch (error) {
    console.error(`Erreur getCabinetById ${id}:`, error);
    throw error;
  }
}
