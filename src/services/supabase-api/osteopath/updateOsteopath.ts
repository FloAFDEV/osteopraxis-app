
import { Osteopath } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export interface OsteopathUpdateInput {
  name?: string;
  professional_title?: string;
  siret?: string;
  rpps_number?: string;
  ape_code?: string;
  stampUrl?: string;
  userId?: string;
}

export async function updateOsteopath(id: number, osteopath: OsteopathUpdateInput): Promise<Osteopath> {
  try {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Préparer les données à envoyer - s'assurer qu'on a au moins un champ
    const payload = {
      id: id,
      ...osteopath
    };

    // Vérifier que le payload n'est pas vide
    if (!payload || Object.keys(payload).length <= 1) { // Seulement l'id
      throw new Error("Aucune donnée à mettre à jour");
    }

    console.log('📤 Envoi des données à la fonction Edge update-osteopath:', payload);
    console.log('📤 Type de payload:', typeof payload);
    console.log('📤 JSON stringified:', JSON.stringify(payload));

    // Appeler la fonction Edge pour mettre à jour l'ostéopathe
    const { data, error } = await supabase.functions.invoke('update-osteopath', {
      body: payload
    });

    console.log('📡 Réponse de la fonction Edge update-osteopath:', { data, error });

    if (error) {
      console.error('🔥 Erreur de la fonction Edge update-osteopath:', error);
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    if (!data?.data) {
      console.error('🔥 Aucune donnée retournée:', data);
      throw new Error("Aucune donnée retournée par la fonction Edge");
    }

    console.log('✅ Ostéopathe mis à jour avec succès:', data.data);

    return data.data as Osteopath;
  } catch (error) {
    console.error("Erreur updateOsteopath:", error);
    throw error;
  }
}
