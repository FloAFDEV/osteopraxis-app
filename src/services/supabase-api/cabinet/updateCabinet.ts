
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

    // Récupérer l'osteopathId de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData?.osteopathId) {
      throw new Error("Profil ostéopathe non trouvé");
    }

    // Vérifier que le cabinet appartient à l'ostéopathe connecté
    const { data: existingCabinet, error: checkError } = await supabase
      .from("Cabinet")
      .select("id, osteopathId")
      .eq("id", id)
      .eq("osteopathId", userData.osteopathId)
      .single();

    if (checkError || !existingCabinet) {
      throw new Error("Cabinet non trouvé ou accès non autorisé");
    }

    // Préparer les données de mise à jour
    const updateData = {
      ...cabinet,
      updatedAt: new Date().toISOString()
    };

    // Nettoyer les valeurs undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    // Mettre à jour le cabinet avec sélection de tous les champs nécessaires
    const { data: updatedCabinet, error: updateError } = await supabase
      .from("Cabinet")
      .update(updateData)
      .eq("id", id)
      .eq("osteopathId", userData.osteopathId)
      .select("id, name, address, phone, email, imageUrl, logoUrl, osteopathId, createdAt, updatedAt, professionalProfileId, tenant_id")
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }

    // Retourner avec les champs manquants remplis par des valeurs par défaut
    return {
      ...updatedCabinet,
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
