
import { supabase } from "@/integrations/supabase/client";
import { Osteopath } from "@/types";

/**
 * Récupère l'ID de l'ostéopathe actuellement connecté en utilisant la fonction SQL
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.log("Aucune session utilisateur trouvée");
      return null;
    }

    console.log("Auth ID de l'utilisateur connecté:", sessionData.session.user.id);

    // Utiliser la nouvelle fonction SQL pour récupérer l'ID de l'ostéopathe
    const { data, error } = await supabase
      .rpc('get_current_osteopath_id');

    if (error) {
      console.error("Erreur lors de la récupération de l'ID de l'ostéopathe:", error);
      return null;
    }

    console.log("ID de l'ostéopathe récupéré:", data);
    return data;
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

    // Vérifier que le patient appartient bien à cet ostéopathe (la RLS s'occupera du reste)
    const { data: patient, error } = await supabase
      .from("Patient")
      .select("osteopathId, cabinetId")
      .eq("id", patientId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du propriétaire du patient:", error);
      return false;
    }

    // Si on peut récupérer le patient, c'est que les politiques RLS l'autorisent
    const isOwned = !!patient;
    console.log(`Patient ${patientId} accessible par l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
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

    // Vérifier via les politiques RLS
    const { data: cabinet, error } = await supabase
      .from("Cabinet")
      .select("id")
      .eq("id", cabinetId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du propriétaire du cabinet:", error);
      return false;
    }

    const isOwned = !!cabinet;
    console.log(`Cabinet ${cabinetId} accessible par l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
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
      .select("id")
      .eq("id", appointmentId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du propriétaire du rendez-vous:", error);
      return false;
    }

    const isOwned = !!appointment;
    console.log(`Rendez-vous ${appointmentId} accessible par l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
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

    const { data: invoice, error } = await supabase
      .from("Invoice")
      .select("id")
      .eq("id", invoiceId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification de propriété de la facture:", error);
      return false;
    }

    const isOwned = !!invoice;
    console.log(`Facture ${invoiceId} accessible par l'ostéopathe ${currentOsteopathId}:`, isOwned);
    
    return isOwned;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété de la facture:", error);
    return false;
  }
};
