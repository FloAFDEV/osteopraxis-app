
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

    // Récupérer l'ostéopathe ID depuis la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("auth_id", session.user.id)
      .maybeSingle();

    if (userError) {
      console.error("Erreur lors de la récupération du profil utilisateur:", userError);
      return undefined;
    }

    if (!userData || !userData.osteopathId) {
      console.warn("Profil ostéopathe non trouvé");
      return undefined;
    }

    // Récupérer le cabinet directement depuis Supabase
    const { data: cabinet, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(`Erreur lors de la récupération du cabinet ${id}:`, error);
      return undefined;
    }

    if (!cabinet) {
      return undefined;
    }

    // Vérifier que l'ostéopathe a accès à ce cabinet (propriétaire ou associé)
    const hasAccess = cabinet.osteopathId === userData.osteopathId || 
      await checkCabinetAssociation(userData.osteopathId, id);

    if (!hasAccess) {
      console.warn(`Accès refusé au cabinet ${id} pour l'ostéopathe ${userData.osteopathId}`);
      return undefined;
    }

    return cabinet as unknown as Cabinet;
  } catch (error) {
    console.error(`Erreur getCabinetById ${id}:`, error);
    throw error;
  }
}

// Fonction helper pour vérifier l'association via osteopath_cabinet
async function checkCabinetAssociation(osteopathId: number, cabinetId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("osteopath_cabinet")
      .select("id")
      .eq("osteopath_id", osteopathId)
      .eq("cabinet_id", cabinetId)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la vérification de l'association:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Erreur checkCabinetAssociation:", error);
    return false;
  }
}
