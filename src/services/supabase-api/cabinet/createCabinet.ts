
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";
import { CabinetCreateInput } from "./types";

export async function createCabinet(cabinet: CabinetCreateInput): Promise<Cabinet> {
  try {
    // Récupérer l'ID de l'ostéopathe connecté
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.error("Tentative de création d'un cabinet sans être connecté");
      throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
    }
    
    // SÉCURITÉ: Vérifier si le client tente de spécifier un osteopathId différent
    if (cabinet.osteopathId && cabinet.osteopathId !== currentOsteopathId) {
      console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: Tentative de création avec osteopathId ${cabinet.osteopathId} différent de l'utilisateur connecté ${currentOsteopathId}`);
    }
    
    // S'assurer que le cabinet est associé à l'ostéopathe connecté
    // Écraser toute tentative de définir un autre osteopathId
    const cabinetWithOsteopath = {
      ...cabinet,
      osteopathId: currentOsteopathId, // Garantir que c'est l'osteopathId de l'utilisateur connecté
    };
    
    console.log(`Création d'un cabinet pour l'ostéopathe ${currentOsteopathId}`);
    
    // Ne jamais envoyer id/timestamps, Postgres gère
    const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...insertable } = cabinetWithOsteopath as any;
    const { data, error } = await supabase
      .from("Cabinet")
      .insert(insertable)
      .select()
      .single();

    if (error) {
      console.error("[SUPABASE ERROR]", error.code, error.message);
      throw error;
    }

    return data as Cabinet;
  } catch (error) {
    console.error("Erreur lors de la création du cabinet:", error);
    throw error;
  }
}
