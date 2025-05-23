
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère l'ID de l'ostéopathe actuellement connecté
 * @returns L'ID de l'ostéopathe ou null si non trouvé
 */
export async function getCurrentOsteopathId(): Promise<number | null> {
  try {
    // Vérifier si un utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté dans getCurrentOsteopathId");
      return null;
    }
    
    // Récupérer l'utilisateur depuis la table User en utilisant auth_id
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("auth_id", user.id)
      .single();
    
    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
      return null;
    }
    
    if (!userData?.osteopathId) {
      console.log("L'utilisateur connecté n'a pas d'osteopathId associé");
      return null;
    }
    
    console.log("[SECURITY] OsteopathId trouvé dans User:", userData.osteopathId, "pour", user.email);
    return userData.osteopathId;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID d'ostéopathe:", error);
    return null;
  }
}

/**
 * Récupère les données de l'ostéopathe actuellement connecté
 * @returns Les données de l'ostéopathe ou null si non trouvé
 */
export async function getCurrentOsteopath(): Promise<{ id: number } | null> {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      return null;
    }
    
    // Récupérer les données de l'ostéopathe
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id, name, userId, siret, adeli_number, ape_code")
      .eq("id", osteopathId)
      .single();
    
    if (osteopathError || !osteopathData) {
      console.error("Erreur lors de la récupération des données d'ostéopathe:", osteopathError);
      return null;
    }
    
    return { id: osteopathData.id };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ostéopathe:", error);
    return null;
  }
}

/**
 * Vérifie si l'ostéopathe cible correspond à l'ostéopathe connecté
 */
export async function isSameOsteopath(targetOsteopathId: number): Promise<boolean> {
  const currentOsteopathId = await getCurrentOsteopathId();
  return currentOsteopathId === targetOsteopathId;
}

/**
 * Vérifie si un patient appartient à l'ostéopathe connecté
 */
export async function isPatientOwnedByCurrentOsteopath(patientId: number): Promise<boolean> {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) return false;
    
    const { data, error } = await supabase
      .from("Patient")
      .select("id")
      .eq("id", patientId)
      .eq("osteopathId", currentOsteopathId)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking patient ownership:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception checking patient ownership:", error);
    return false;
  }
}

/**
 * Vérifie si un cabinet appartient à l'ostéopathe connecté
 */
export async function isCabinetOwnedByCurrentOsteopath(cabinetId: number): Promise<boolean> {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) return false;
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("id")
      .eq("id", cabinetId)
      .eq("osteopathId", currentOsteopathId)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking cabinet ownership:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception checking cabinet ownership:", error);
    return false;
  }
}

/**
 * Vérifie si un rendez-vous appartient à l'ostéopathe connecté
 */
export async function isAppointmentOwnedByCurrentOsteopath(appointmentId: number): Promise<boolean> {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) return false;
    
    // Vérifier si le rendez-vous appartient à un patient de l'ostéopathe connecté
    const { data, error } = await supabase
      .from("Appointment")
      .select("patientId")
      .eq("id", appointmentId)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Error finding appointment:", error);
      return false;
    }
    
    return await isPatientOwnedByCurrentOsteopath(data.patientId);
  } catch (error) {
    console.error("Exception checking appointment ownership:", error);
    return false;
  }
}

/**
 * Vérifie si une facture appartient à l'ostéopathe connecté
 */
export async function isInvoiceOwnedByCurrentOsteopath(invoiceId: number): Promise<boolean> {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) return false;
    
    // Vérifier si la facture appartient à un patient de l'ostéopathe connecté
    const { data, error } = await supabase
      .from("Invoice")
      .select("patientId")
      .eq("id", invoiceId)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Error finding invoice:", error);
      return false;
    }
    
    return await isPatientOwnedByCurrentOsteopath(data.patientId);
  } catch (error) {
    console.error("Exception checking invoice ownership:", error);
    return false;
  }
}
