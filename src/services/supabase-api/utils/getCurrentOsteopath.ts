
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère l'ID de l'ostéopathe associé à l'utilisateur connecté
 * @returns L'ID de l'ostéopathe ou null si non trouvé
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
  try {
    // 1. Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("[SECURITY] Erreur ou session non trouvée:", sessionError || "Pas de session active");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    if (!userId) {
      console.error("[SECURITY] User ID non disponible dans la session");
      return null;
    }
    
    console.log("[SECURITY] Recherche de l'osteopathId pour userId:", userId);
    
    // 2. Rechercher d'abord dans la table User pour obtenir l'osteopathId
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId, email, first_name, last_name")
      .eq("id", userId)
      .maybeSingle();
      
    if (userError) {
      console.error("[SECURITY] Erreur lors de la recherche de l'utilisateur:", userError);
    }
    
    // Si l'osteopathId est présent dans User, le retourner directement
    if (userData?.osteopathId) {
      console.log("[SECURITY] OsteopathId trouvé dans User:", userData.osteopathId, "pour", userData.email, userData.first_name, userData.last_name);
      return userData.osteopathId;
    }
    
    // 3. Sinon, rechercher dans la table Osteopath par userId
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id, name, userId")
      .eq("userId", userId)
      .maybeSingle();
      
    if (osteopathError) {
      console.error("[SECURITY] Erreur lors de la recherche de l'ostéopathe:", osteopathError);
      return null;
    }
    
    if (!osteopathData) {
      console.log("[SECURITY] Aucun profil ostéopathe trouvé pour userId:", userId);
      return null;
    }
    
    console.log("[SECURITY] OsteopathId trouvé dans Osteopath:", osteopathData.id, "pour", osteopathData.name);
    
    // 4. Mettre à jour la table User avec l'osteopathId pour les futures requêtes
    if (osteopathData.id) {
      try {
        const { error: updateError } = await supabase
          .from("User")
          .update({ osteopathId: osteopathData.id })
          .eq("id", userId);
          
        if (updateError) {
          console.error("[SECURITY] Erreur lors de la mise à jour de l'utilisateur avec osteopathId:", updateError);
        } else {
          console.log("[SECURITY] User mis à jour avec osteopathId:", osteopathData.id);
        }
      } catch (updateError) {
        console.error("[SECURITY] Exception lors de la mise à jour de l'utilisateur:", updateError);
      }
    }
    
    return osteopathData.id;
  } catch (error) {
    console.error("[SECURITY] Erreur inattendue dans getCurrentOsteopathId:", error);
    return null;
  }
};

/**
 * Vérifie si l'ostéopathe spécifié est celui connecté
 * @param osteopathId ID de l'ostéopathe à vérifier
 * @returns true si c'est l'ostéopathe connecté, false sinon
 */
export const isSameOsteopath = async (osteopathId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    const result = currentOsteopathId === osteopathId;
    if (!result) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès à l'ostéopathe ${osteopathId} par l'ostéopathe ${currentOsteopathId}`);
    }
    return result;
  } catch (error) {
    console.error("[SECURITY] Erreur lors de la vérification de l'ostéopathe:", error);
    return false;
  }
};

/**
 * Vérifie si un patient appartient à l'ostéopathe connecté
 * @param patientId ID du patient à vérifier
 * @returns true si le patient appartient à l'ostéopathe connecté, false sinon
 */
export const isPatientOwnedByCurrentOsteopath = async (patientId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("[SECURITY] Tentative de vérification de propriété d'un patient sans osteopathId");
      return false;
    }
    
    const { data, error } = await supabase
      .from("Patient")
      .select("id, firstName, lastName")
      .eq("id", patientId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();
      
    if (error) {
      console.error(`[SECURITY] Erreur lors de la vérification du patient ${patientId}:`, error);
      return false;
    }
    
    if (!data) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès au patient ${patientId} qui n'appartient pas à l'ostéopathe ${osteopathId}`);
    }
    
    return !!data;
  } catch (error) {
    console.error(`[SECURITY] Erreur lors de la vérification de propriété du patient ${patientId}:`, error);
    return false;
  }
};

/**
 * Vérifie si un cabinet appartient à l'ostéopathe connecté
 * @param cabinetId ID du cabinet à vérifier
 * @returns true si le cabinet appartient à l'ostéopathe connecté, false sinon
 */
export const isCabinetOwnedByCurrentOsteopath = async (cabinetId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("[SECURITY] Tentative de vérification de propriété d'un cabinet sans osteopathId");
      return false;
    }
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("id, name")
      .eq("id", cabinetId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();
      
    if (error) {
      console.error(`[SECURITY] Erreur lors de la vérification du cabinet ${cabinetId}:`, error);
      return false;
    }
    
    if (!data) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès au cabinet ${cabinetId} qui n'appartient pas à l'ostéopathe ${osteopathId}`);
    }
    
    return !!data;
  } catch (error) {
    console.error(`[SECURITY] Erreur lors de la vérification de propriété du cabinet ${cabinetId}:`, error);
    return false;
  }
};

/**
 * Vérifie si un rendez-vous appartient à l'ostéopathe connecté
 */
export const isAppointmentOwnedByCurrentOsteopath = async (appointmentId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("[SECURITY] Tentative de vérification de propriété d'un rendez-vous sans osteopathId");
      return false;
    }
    
    // D'abord vérifier si le rendez-vous a directement un osteopathId qui correspond
    const { data: directCheck, error: directError } = await supabase
      .from("Appointment")
      .select("id, patientId")
      .eq("id", appointmentId)
      .eq("osteopathId", osteopathId)  // Vérification directe si le champ existe
      .maybeSingle();
      
    if (directError) {
      console.error(`[SECURITY] Erreur lors de la vérification directe du rendez-vous ${appointmentId}:`, directError);
    }
    
    // Si on a une correspondance directe, c'est bon
    if (directCheck) {
      return true;
    }
    
    // Sinon on vérifie via le patientId du rendez-vous
    const { data: appointment, error: appointmentError } = await supabase
      .from("Appointment")
      .select("patientId")
      .eq("id", appointmentId)
      .maybeSingle();
      
    if (appointmentError || !appointment) {
      console.error(`[SECURITY] Erreur lors de la récupération du rendez-vous ${appointmentId}:`, appointmentError);
      return false;
    }
    
    // Vérifier que le patient appartient à l'ostéopathe connecté sans utiliser isPatientOwnedByCurrentOsteopath
    // pour éviter la récursion potentielle
    const { data: patientData, error: patientError } = await supabase
      .from("Patient")
      .select("id")
      .eq("id", appointment.patientId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();
      
    if (patientError) {
      console.error(`[SECURITY] Erreur lors de la vérification du patient ${appointment.patientId}:`, patientError);
      return false;
    }
    
    if (!patientData) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès au rendez-vous ${appointmentId} qui n'appartient pas à l'ostéopathe ${osteopathId}`);
    }
    
    return !!patientData;
  } catch (error) {
    console.error(`[SECURITY] Erreur lors de la vérification de propriété du rendez-vous ${appointmentId}:`, error);
    return false;
  }
};

/**
 * Vérifie si une facture appartient à l'ostéopathe connecté
 */
export const isInvoiceOwnedByCurrentOsteopath = async (invoiceId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("[SECURITY] Tentative de vérification de propriété d'une facture sans osteopathId");
      return false;
    }
    
    // D'abord vérifier si la facture a directement un osteopathId qui correspond
    const { data: directCheck, error: directError } = await supabase
      .from("Invoice")
      .select("id, patientId")
      .eq("id", invoiceId)
      .eq("osteopathId", osteopathId)  // Vérification directe si le champ existe
      .maybeSingle();
      
    if (directError) {
      console.error(`[SECURITY] Erreur lors de la vérification directe de la facture ${invoiceId}:`, directError);
    }
    
    // Si on a une correspondance directe, c'est bon
    if (directCheck) {
      return true;
    }
    
    // Sinon on vérifie via le patientId de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from("Invoice")
      .select("patientId")
      .eq("id", invoiceId)
      .maybeSingle();
      
    if (invoiceError || !invoice) {
      console.error(`[SECURITY] Erreur lors de la récupération de la facture ${invoiceId}:`, invoiceError);
      return false;
    }
    
    // Vérifier que le patient appartient à l'ostéopathe connecté sans utiliser isPatientOwnedByCurrentOsteopath 
    // pour éviter une récursion potentielle
    const { data: patientData, error: patientError } = await supabase
      .from("Patient")
      .select("id")
      .eq("id", invoice.patientId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();
      
    if (patientError) {
      console.error(`[SECURITY] Erreur lors de la vérification du patient ${invoice.patientId}:`, patientError);
      return false;
    }
    
    if (!patientData) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès à la facture ${invoiceId} qui n'appartient pas à l'ostéopathe ${osteopathId}`);
    }
    
    return !!patientData;
  } catch (error) {
    console.error(`[SECURITY] Erreur lors de la vérification de propriété de la facture ${invoiceId}:`, error);
    return false;
  }
};
