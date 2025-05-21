
import { getCurrentOsteopathId } from "../getCurrentOsteopath";
import { supabase } from "@/integrations/supabase/client";
import type { PatientRow, AppointmentRow, InvoiceRow, CabinetRow } from "./securityTypes";

/**
 * Vérifie si le patient appartient à l'ostéopathe connecté
 * @param patientId ID du patient à vérifier
 * @returns true si le patient appartient à l'ostéopathe connecté, false sinon
 */
export const isPatientOwnedByCurrentOsteopath = async (patientId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.warn("[SECURITY] Tentative d'accès à un patient sans profil ostéopathe");
      return false;
    }
    
    const { data, error } = await supabase
      .from("Patient")
      .select("osteopathId")
      .eq("id", patientId)
      .maybeSingle();
      
    if (error || !data) {
      console.error("[SECURITY] Erreur ou patient non trouvé:", error);
      return false;
    }
    
    const patientData = data as PatientRow;
    const result = patientData.osteopathId === currentOsteopathId;
    
    if (!result) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès au patient ${patientId} (ostéopathe ${patientData.osteopathId}) par l'ostéopathe ${currentOsteopathId}`);
    }
    
    return result;
  } catch (error) {
    console.error("[SECURITY] Erreur lors de la vérification du patient:", error);
    return false;
  }
};

/**
 * Vérifie si le cabinet appartient à l'ostéopathe connecté
 * @param cabinetId ID du cabinet à vérifier
 * @returns true si le cabinet appartient à l'ostéopathe connecté, false sinon
 */
export const isCabinetOwnedByCurrentOsteopath = async (cabinetId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.warn("[SECURITY] Tentative d'accès à un cabinet sans profil ostéopathe");
      return false;
    }
    
    const { data, error } = await supabase
      .from("Cabinet")
      .select("osteopathId")
      .eq("id", cabinetId)
      .maybeSingle();
      
    if (error || !data) {
      console.error("[SECURITY] Erreur ou cabinet non trouvé:", error);
      return false;
    }
    
    const cabinetData = data as CabinetRow;
    const result = cabinetData.osteopathId === currentOsteopathId;
    
    if (!result) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès au cabinet ${cabinetId} (ostéopathe ${cabinetData.osteopathId}) par l'ostéopathe ${currentOsteopathId}`);
    }
    
    return result;
  } catch (error) {
    console.error("[SECURITY] Erreur lors de la vérification du cabinet:", error);
    return false;
  }
};

/**
 * Vérifie si le rendez-vous appartient à l'ostéopathe connecté
 * @param appointmentId ID du rendez-vous à vérifier
 * @returns true si le rendez-vous appartient à l'ostéopathe connecté, false sinon
 */
export const isAppointmentOwnedByCurrentOsteopath = async (appointmentId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.warn("[SECURITY] Tentative d'accès à un rendez-vous sans profil ostéopathe");
      return false;
    }
    
    // Récupérer le patient associé au rendez-vous
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("Appointment")
      .select("patientId")
      .eq("id", appointmentId)
      .maybeSingle();
      
    if (appointmentError || !appointmentData) {
      console.error("[SECURITY] Erreur ou rendez-vous non trouvé:", appointmentError);
      return false;
    }
    
    // Vérifier que le patient du rendez-vous appartient à l'ostéopathe
    return isPatientOwnedByCurrentOsteopath(appointmentData.patientId);
  } catch (error) {
    console.error("[SECURITY] Erreur lors de la vérification du rendez-vous:", error);
    return false;
  }
};

/**
 * Vérifie si la facture appartient à l'ostéopathe connecté
 * @param invoiceId ID de la facture à vérifier
 * @returns true si la facture appartient à l'ostéopathe connecté, false sinon
 */
export const isInvoiceOwnedByCurrentOsteopath = async (invoiceId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.warn("[SECURITY] Tentative d'accès à une facture sans profil ostéopathe");
      return false;
    }
    
    // Récupérer le patient associé à la facture
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("Invoice")
      .select("patientId")
      .eq("id", invoiceId)
      .maybeSingle();
      
    if (invoiceError || !invoiceData) {
      console.error("[SECURITY] Erreur ou facture non trouvée:", invoiceError);
      return false;
    }
    
    // Vérifier que le patient de la facture appartient à l'ostéopathe
    return isPatientOwnedByCurrentOsteopath(invoiceData.patientId);
  } catch (error) {
    console.error("[SECURITY] Erreur lors de la vérification de la facture:", error);
    return false;
  }
};
