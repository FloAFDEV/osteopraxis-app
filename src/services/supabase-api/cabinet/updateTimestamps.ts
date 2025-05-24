
import { supabase } from "@/integrations/supabase/client";

export async function updateTimestamps(cabinetId: number): Promise<void> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Appeler la fonction Edge sécurisée pour mettre à jour les timestamps
    const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/cabinet?id=${cabinetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des timestamps:", error);
    throw error;
  }
}
