
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export async function getCabinets(): Promise<Cabinet[]> {
  try {
    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("Aucune session active lors de la récupération des cabinets");
      return [];
    }

    // Récupérer l'ostéopathe ID depuis la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("auth_id", session.user.id)
      .maybeSingle();

    if (userError) {
      console.error("Erreur lors de la récupération du profil utilisateur:", userError);
      return [];
    }

    if (!userData || !userData.osteopathId) {
      console.warn("Profil ostéopathe non trouvé");
      return [];
    }

    // Récupérer les cabinets directement depuis Supabase
    // 1. Cabinets où l'ostéopathe est propriétaire
    const { data: ownedCabinets, error: ownedError } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", userData.osteopathId);

    if (ownedError) {
      console.error("Erreur lors de la récupération des cabinets propriétaires:", ownedError);
      return [];
    }

    // 2. Cabinets où l'ostéopathe est associé via osteopath_cabinet
    const { data: associatedCabinetIds, error: assocError } = await supabase
      .from("osteopath_cabinet")
      .select("cabinet_id")
      .eq("osteopath_id", userData.osteopathId);

    let associatedCabinets: any[] = [];
    if (assocError) {
      console.error("Erreur lors de la récupération des associations:", assocError);
    } else if (associatedCabinetIds && associatedCabinetIds.length > 0) {
      const cabinetIds = associatedCabinetIds.map(a => a.cabinet_id);
      const { data: assocCabinets, error: assocCabinetsError } = await supabase
        .from("Cabinet")
        .select("*")
        .in("id", cabinetIds);

      if (assocCabinetsError) {
        console.error("Erreur lors de la récupération des cabinets associés:", assocCabinetsError);
      } else {
        associatedCabinets = assocCabinets || [];
      }
    }

    // Combiner et dédupliquer les résultats
    const allCabinets = [...(ownedCabinets || []), ...associatedCabinets];
    const uniqueCabinets = allCabinets.filter((cabinet, index, self) => 
      index === self.findIndex(c => c.id === cabinet.id)
    );

    return uniqueCabinets as unknown as Cabinet[];
  } catch (error) {
    console.error("Erreur getCabinets:", error);
    throw error;
  }
}
