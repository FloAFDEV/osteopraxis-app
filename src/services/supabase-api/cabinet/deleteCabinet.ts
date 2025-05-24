
import { supabase } from "@/integrations/supabase/client";

export async function deleteCabinet(id: number): Promise<void> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Appeler la fonction Edge sécurisée
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("Erreur deleteCabinet:", error);
    throw error;
  }
}
