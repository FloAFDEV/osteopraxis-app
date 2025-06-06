
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère l'ID de l'ostéopathe actuellement connecté
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.log("Aucune session utilisateur trouvée");
      return null;
    }

    const authId = sessionData.session.user.id;
    console.log("Auth ID de l'utilisateur connecté:", authId);

    // Récupérer l'utilisateur avec auth_id pour obtenir osteopathId
    const { data: users, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("auth_id", authId);

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError);
      return null;
    }

    if (!users || users.length === 0) {
      console.log("Aucun utilisateur trouvé avec auth_id:", authId);
      return null;
    }

    const osteopathId = users[0].osteopathId;
    console.log("ID de l'ostéopathe récupéré:", osteopathId);

    return osteopathId;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID de l'ostéopathe:", error);
    return null;
  }
};

/**
 * Vérifie si un patient appartient à l'ostéopathe actuellement connecté
 */
export const isPatientOwnedByCurrentOsteopath = async (patientId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.log("Impossible de récupérer l'ID de l'ostéopathe connecté");
      return false;
    }

    // Vérifier que le patient appartient bien à cet ostéopathe
    const { data: patient, error } = await supabase
      .from("Patient")
      .select("osteopathId")
      .eq("id", patientId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du propriétaire du patient:", error);
      return false;
    }

    const isOwned = patient && patient.osteopathId === currentOsteopathId;
    console.log(`Patient ${patientId} appartient à l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
    return isOwned;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété du patient:", error);
    return false;
  }
};
