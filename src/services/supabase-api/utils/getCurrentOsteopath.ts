
import { supabase } from "@/integrations/supabase/client";
import { Osteopath } from "@/types";

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

    // Récupérer l'utilisateur avec auth_id pour obtenir osteopathId et role
    const { data: users, error: userError } = await supabase
      .from("User")
      .select("osteopathId, role")
      .eq("auth_id", authId);

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError);
      return null;
    }

    if (!users || users.length === 0) {
      console.log("Aucun utilisateur trouvé avec auth_id:", authId);
      return null;
    }

    const user = users[0];
    
    // Pour les admins, on retourne un ID spécial pour indiquer un accès admin
    if (user.role === 'ADMIN') {
      console.log("Utilisateur admin détecté - accès total autorisé");
      return -1; // ID spécial pour les admins
    }

    const osteopathId = user.osteopathId;
    console.log("ID de l'ostéopathe récupéré:", osteopathId);

    return osteopathId;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID de l'ostéopathe:", error);
    return null;
  }
};

/**
 * Récupère les données complètes de l'ostéopathe actuellement connecté
 */
export const getCurrentOsteopath = async (): Promise<Osteopath | null> => {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      return null;
    }

    const { data: osteopath, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", osteopathId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de l'ostéopathe:", error);
      return null;
    }

    return osteopath as Osteopath;
  } catch (error) {
    console.error("Erreur dans getCurrentOsteopath:", error);
    return null;
  }
};

/**
 * Vérifie si deux ostéopathes sont identiques
 */
export const isSameOsteopath = async (osteopathId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    return currentOsteopathId === osteopathId;
  } catch (error) {
    console.error("Erreur dans isSameOsteopath:", error);
    return false;
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

/**
 * Vérifie si un cabinet appartient à l'ostéopathe actuellement connecté
 */
export const isCabinetOwnedByCurrentOsteopath = async (cabinetId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.log("Impossible de récupérer l'ID de l'ostéopathe connecté");
      return false;
    }

    const { data: cabinet, error } = await supabase
      .from("Cabinet")
      .select("osteopathId")
      .eq("id", cabinetId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du propriétaire du cabinet:", error);
      return false;
    }

    const isOwned = cabinet && cabinet.osteopathId === currentOsteopathId;
    console.log(`Cabinet ${cabinetId} appartient à l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
    return isOwned;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété du cabinet:", error);
    return false;
  }
};

/**
 * Vérifie si un rendez-vous appartient à l'ostéopathe actuellement connecté
 */
export const isAppointmentOwnedByCurrentOsteopath = async (appointmentId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.log("Impossible de récupérer l'ID de l'ostéopathe connecté");
      return false;
    }

    const { data: appointment, error } = await supabase
      .from("Appointment")
      .select("osteopathId")
      .eq("id", appointmentId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du propriétaire du rendez-vous:", error);
      return false;
    }

    const isOwned = appointment && appointment.osteopathId === currentOsteopathId;
    console.log(`Rendez-vous ${appointmentId} appartient à l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
    return isOwned;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété du rendez-vous:", error);
    return false;
  }
};

/**
 * Vérifie si une facture appartient à l'ostéopathe actuellement connecté
 */
export const isInvoiceOwnedByCurrentOsteopath = async (invoiceId: number): Promise<boolean> => {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) {
      console.log("Impossible de récupérer l'ID de l'ostéopathe connecté");
      return false;
    }

    // D'abord récupérer la facture pour avoir le patientId
    const { data: invoice, error: invoiceError } = await supabase
      .from("Invoice")
      .select("patientId")
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      console.error("Erreur lors de la récupération de la facture:", invoiceError);
      return false;
    }

    if (!invoice) {
      return false;
    }

    // Ensuite vérifier que le patient appartient à l'ostéopathe
    return await isPatientOwnedByCurrentOsteopath(invoice.patientId);
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété de la facture:", error);
    return false;
  }
};
