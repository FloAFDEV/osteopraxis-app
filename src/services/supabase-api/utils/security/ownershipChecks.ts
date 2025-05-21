
import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentRow, InvoiceRow, PatientRow, CabinetRow } from './securityTypes';
import { getCurrentOsteopathId } from '../getCurrentOsteopath';
import { supabase } from '@/integrations/supabase/client';

/**
 * Vérifie si un patient appartient à l'ostéopathe connecté
 */
export const isPatientOwnedByCurrentOsteopath = async (patientId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("[SECURITY] Tentative de vérification de propriété d'un patient sans osteopathId");
      return false;
    }
    
    return await checkPatientOwnership(supabase, patientId, osteopathId);
  } catch (error) {
    console.error(`[SECURITY] Erreur lors de la vérification de propriété du patient ${patientId}:`, error);
    return false;
  }
};

/**
 * Vérifie si un cabinet appartient à l'ostéopathe connecté
 */
export const isCabinetOwnedByCurrentOsteopath = async (cabinetId: number): Promise<boolean> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      console.warn("[SECURITY] Tentative de vérification de propriété d'un cabinet sans osteopathId");
      return false;
    }
    
    return await checkCabinetOwnership(supabase, cabinetId, osteopathId);
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
    
    const isOwned = await checkAppointmentOwnership(supabase, appointmentId, osteopathId);
    
    if (!isOwned) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès au rendez-vous ${appointmentId} qui n'appartient pas à l'ostéopathe ${osteopathId}`);
    }
    
    return isOwned;
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
    
    const isOwned = await checkInvoiceOwnership(supabase, invoiceId, osteopathId);
    
    if (!isOwned) {
      console.warn(`[SECURITY VIOLATION] Tentative d'accès à la facture ${invoiceId} qui n'appartient pas à l'ostéopathe ${osteopathId}`);
    }
    
    return isOwned;
  } catch (error) {
    console.error(`[SECURITY] Erreur lors de la vérification de propriété de la facture ${invoiceId}:`, error);
    return false;
  }
};

/**
 * Vérifie si l'utilisateur connecté est bien le propriétaire du patient
 */
export async function checkPatientOwnership(
  supabase: SupabaseClient,
  patientId: number,
  osteopathId: number
): Promise<boolean> {
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

  return !!data;
}

/**
 * Vérifie si l'utilisateur connecté est bien le propriétaire du cabinet
 */
export async function checkCabinetOwnership(
  supabase: SupabaseClient,
  cabinetId: number,
  osteopathId: number
): Promise<boolean> {
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

  return !!data;
}

/**
 * Vérifie si l'utilisateur connecté est bien le propriétaire du rendez-vous
 */
export async function checkAppointmentOwnership(
  supabase: SupabaseClient,
  appointmentId: number,
  osteopathId: number
): Promise<boolean> {
  // Vérification directe via le champ osteopathId
  const { data, error } = await supabase
    .from("Appointment")
    .select("id, patientId")
    .eq("id", appointmentId)
    .eq("osteopathId", osteopathId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la vérification directe du rendez-vous:", error);
    return false;
  }

  if (data) return true;

  // Si aucun résultat direct, on vérifie via le patientId
  const { data: appointmentData, error: appointmentError } = await supabase
    .from("Appointment")
    .select("patientId")
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    console.error(`Erreur lors de la récupération du rendez-vous ${appointmentId}:`, appointmentError);
    return false;
  }

  // Vérifier que le patient appartient à l'ostéopathe
  return await checkPatientOwnership(supabase, appointmentData.patientId, osteopathId);
}

/**
 * Vérifie si l'utilisateur connecté est bien le propriétaire de la facture
 */
export async function checkInvoiceOwnership(
  supabase: SupabaseClient,
  invoiceId: number,
  osteopathId: number
): Promise<boolean> {
  // Vérification directe via le champ osteopathId de la facture
  const { data, error } = await supabase
    .from("Invoice")
    .select("id, patientId")
    .eq("id", invoiceId)
    .eq("osteopathId", osteopathId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la vérification directe de la facture:", error);
    return false;
  }

  if (data) return true;

  // Sinon, chercher via le rendez-vous lié à la facture
  const { data: invoiceWithAppointment, error: joinError } = await supabase
    .from("Invoice")
    .select(`
      id, 
      patientId,
      appointmentId
    `)
    .eq("id", invoiceId)
    .maybeSingle();

  if (joinError) {
    console.error("Erreur lors de la vérification jointe de la facture:", joinError);
    return false;
  }

  if (!invoiceWithAppointment) return false;

  // Si la facture a un rendez-vous associé, vérifier la propriété du rendez-vous
  if (invoiceWithAppointment.appointmentId) {
    const appointmentOwned = await checkAppointmentOwnership(
      supabase, 
      invoiceWithAppointment.appointmentId, 
      osteopathId
    );
    if (appointmentOwned) return true;
  }

  // Sinon vérifier via le patientId
  return await checkPatientOwnership(supabase, invoiceWithAppointment.patientId, osteopathId);
}
