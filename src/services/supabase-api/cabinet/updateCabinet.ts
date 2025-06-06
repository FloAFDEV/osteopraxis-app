
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CabinetUpdateInput } from "./types";

export async function updateCabinet(id: number, cabinet: CabinetUpdateInput): Promise<Cabinet> {
  try {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Préparer les données à envoyer
    const payload = {
      id: id,
      ...cabinet
    };

    console.log('📤 Envoi des données à la fonction Edge:', payload);

    // Appeler la fonction Edge pour mettre à jour le cabinet
    // supabase.functions.invoke gère automatiquement la sérialisation JSON
    const { data, error } = await supabase.functions.invoke('update-cabinet', {
      body: payload, // Passer l'objet directement, pas JSON.stringify()
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    });

    if (error) {
      console.error('🔥 Erreur de la fonction Edge:', error);
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    if (!data?.data) {
      console.error('🔥 Aucune donnée retournée:', data);
      throw new Error("Aucune donnée retournée par la fonction Edge");
    }

    console.log('✅ Cabinet mis à jour avec succès:', data.data);

    // Retourner avec les champs manquants remplis par des valeurs par défaut
    return {
      ...data.data,
      city: data.data.city || "", // Valeur par défaut pour compatibilité TypeScript
      postalCode: data.data.postalCode || "", // Valeur par défaut pour compatibilité TypeScript
      siret: data.data.siret || null, // Valeur par défaut pour compatibilité TypeScript
      iban: data.data.iban || null, // Valeur par défaut pour compatibilité TypeScript
      bic: data.data.bic || null, // Valeur par défaut pour compatibilité TypeScript
      country: data.data.country || "France", // Valeur par défaut pour compatibilité TypeScript
    } as Cabinet;
  } catch (error) {
    console.error("Erreur updateCabinet:", error);
    throw error;
  }
}
