
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

    // Préparer les données à envoyer - s'assurer qu'on a au moins un champ
    const payload = {
      id: id,
      ...cabinet
    };

    // Vérifier que le payload n'est pas vide
    if (!payload || Object.keys(payload).length <= 1) { // Seulement l'id
      throw new Error("Aucune donnée à mettre à jour");
    }

    console.log('📤 Envoi des données à la fonction Edge:', payload);
    console.log('📤 Type de payload:', typeof payload);
    console.log('📤 JSON stringified:', JSON.stringify(payload));

    // Appeler la fonction Edge pour mettre à jour le cabinet
    const { data, error } = await supabase.functions.invoke('update-cabinet', {
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    });

    console.log('📡 Réponse de la fonction Edge:', { data, error });

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
      city: data.data.city || "",
      postalCode: data.data.postalCode || "",
      siret: data.data.siret || null,
      iban: data.data.iban || null,
      bic: data.data.bic || null,
      country: data.data.country || "France",
    } as Cabinet;
  } catch (error) {
    console.error("Erreur updateCabinet:", error);
    throw error;
  }
}
