
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère l'ID de l'ostéopathe connecté
 * @returns L'ID de l'ostéopathe ou null si non connecté/non trouvé
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
  try {
    // Récupérer la session de l'utilisateur
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.log("Aucune session utilisateur active");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Récupérer l'ostéopathe associé à cet utilisateur
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();
    
    if (osteopathError) {
      console.error("Erreur lors de la récupération de l'ostéopathe:", osteopathError);
      return null;
    }
    
    if (!osteopathData) {
      console.log("Aucun profil d'ostéopathe trouvé pour l'utilisateur", userId);
      return null;
    }
    
    console.log("[SECURITY] OsteopathId trouvé pour l'utilisateur", userId, ":", osteopathData.id);
    return osteopathData.id;
  } catch (error) {
    console.error("Exception dans getCurrentOsteopathId:", error);
    return null;
  }
};

/**
 * Vérifie si l'ostéopathe connecté est le même que celui spécifié
 * @param osteopathId ID de l'ostéopathe à vérifier
 * @returns true si c'est le même ostéopathe, false sinon
 */
export const isSameOsteopath = async (osteopathId: number): Promise<boolean> => {
  const currentOsteopathId = await getCurrentOsteopathId();
  return currentOsteopathId === osteopathId;
};

/**
 * Vérifie si un patient appartient à l'ostéopathe connecté
 * @param patientId ID du patient à vérifier
 * @returns true si le patient appartient à l'ostéopathe connecté, false sinon
 */
export const isPatientOwnedByCurrentOsteopath = async (patientId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      return false;
    }
    
    // Vérifier si le patient appartient à l'ostéopathe connecté
    const { data, error } = await supabase
      .from("Patient")
      .select("id")
      .eq("id", patientId)
      .eq("osteopathId", currentOsteopathId)
      .maybeSingle();
      
    if (error) {
      console.error("Erreur lors de la vérification de la propriété du patient:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception dans isPatientOwnedByCurrentOsteopath:", error);
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
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      return false;
    }
    
    // Vérifier si le cabinet appartient à l'ostéopathe connecté
    const { data, error } = await supabase
      .from("Cabinet")
      .select("id")
      .eq("id", cabinetId)
      .eq("osteopathId", currentOsteopathId)
      .maybeSingle();
      
    if (error) {
      console.error("Erreur lors de la vérification de la propriété du cabinet:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception dans isCabinetOwnedByCurrentOsteopath:", error);
    return false;
  }
};

/**
 * Vérifie si un rendez-vous appartient à l'ostéopathe connecté
 * @param appointmentId ID du rendez-vous à vérifier
 * @returns true si le rendez-vous appartient à l'ostéopathe connecté, false sinon
 */
export const isAppointmentOwnedByCurrentOsteopath = async (appointmentId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      return false;
    }
    
    // Option simplifiée: vérifier si l'ID de l'ostéopathe correspond
    const { data, error } = await supabase
      .from("Appointment")
      .select("id")
      .eq("id", appointmentId)
      .eq("osteopathId", currentOsteopathId)
      .maybeSingle();
      
    if (error) {
      console.error("Erreur lors de la vérification de la propriété du rendez-vous:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception dans isAppointmentOwnedByCurrentOsteopath:", error);
    return false;
  }
};

/**
 * Vérifie si une facture appartient à l'ostéopathe connecté
 * @param invoiceId ID de la facture à vérifier
 * @returns true si la facture appartient à l'ostéopathe connecté, false sinon
 */
export const isInvoiceOwnedByCurrentOsteopath = async (invoiceId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      return false;
    }
    
    // Vérifier si la facture appartient à l'ostéopathe connecté
    const { data, error } = await supabase
      .from("Invoice")
      .select("id")
      .eq("id", invoiceId)
      .eq("osteopathId", currentOsteopathId)
      .maybeSingle();
      
    if (error) {
      console.error("Erreur lors de la vérification de la propriété de la facture:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception dans isInvoiceOwnedByCurrentOsteopath:", error);
    return false;
  }
};
