
import { Osteopath } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function updateOsteopath(
  id: number,
  osteoData: Partial<Omit<Osteopath, "id" | "createdAt">>
): Promise<Osteopath | undefined> {
  try {
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Non autorisé: vous devez être connecté");
    }

    // Préparer les données à envoyer
    const payload = {
      id: id,
      ...osteoData,
      updatedAt: new Date().toISOString()
    };

    console.log('📤 Envoi des données à la fonction Edge updateOsteopath:', payload);

    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('update-osteopath', {
      body: payload
    });

    console.log('📡 Réponse de la fonction Edge updateOsteopath:', { data, error });

    if (error) {
      console.error('🔥 Erreur de la fonction Edge updateOsteopath:', error);
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    if (!data?.data) {
      console.error('🔥 Aucune donnée retournée par updateOsteopath:', data);
      throw new Error("Aucune donnée retournée par la fonction Edge");
    }

    console.log('✅ Ostéopathe mis à jour avec succès:', data.data);
    return data.data as Osteopath;
  } catch (error) {
    console.error("Erreur updateOsteopath:", error);
    throw error;
  }
}
