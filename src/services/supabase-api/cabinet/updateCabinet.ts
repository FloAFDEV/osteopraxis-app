
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

    // Appeler la fonction Edge pour mettre à jour le cabinet
    // Utiliser POST au lieu de PATCH pour éviter les problèmes CORS
    const { data, error } = await supabase.functions.invoke('update-cabinet', {
      body: {
        id: id,
        ...cabinet
      },
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    });

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    if (!data?.data) {
      throw new Error("Aucune donnée retournée par la fonction Edge");
    }

    // Retourner avec les champs manquants remplis par des valeurs par défaut
    return {
      ...data.data,
      city: "", // Valeur par défaut pour compatibilité TypeScript
      postalCode: "", // Valeur par défaut pour compatibilité TypeScript
      siret: null, // Valeur par défaut pour compatibilité TypeScript
      iban: null, // Valeur par défaut pour compatibilité TypeScript
      bic: null, // Valeur par défaut pour compatibilité TypeScript
      country: "France", // Valeur par défaut pour compatibilité TypeScript
    } as Cabinet;
  } catch (error) {
    console.error("Erreur updateCabinet:", error);
    throw error;
  }
}
