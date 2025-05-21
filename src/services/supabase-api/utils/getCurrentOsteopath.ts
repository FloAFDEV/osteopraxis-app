
import { supabase } from "@/integrations/supabase/client";

// Simplify return type to avoid excessive type instantiation
export async function getCurrentOsteopathId(): Promise<number | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté dans getCurrentOsteopathId");
      return null;
    }
    
    // Récupérer l'utilisateur complet à partir de la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("id", user.id)
      .single();
    
    if (userError || !userData) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
      return null;
    }
    
    if (!userData.osteopathId) {
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

// Simplify return type to avoid excessive type instantiation
export async function getCurrentOsteopath(): Promise<{ id: number } | null> {
  try {
    const osteopathId = await getCurrentOsteopathId();
    
    if (!osteopathId) {
      return null;
    }
    
    // Récupérer les données complètes de l'ostéopathe
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

// Add missing security functions
export async function isSameOsteopath(targetOsteopathId: number): Promise<boolean> {
  const currentOsteopathId = await getCurrentOsteopathId();
  return currentOsteopathId === targetOsteopathId;
}

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

export async function isAppointmentOwnedByCurrentOsteopath(appointmentId: number): Promise<boolean> {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) return false;
    
    // Check if the appointment's patient is owned by current osteopath
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

export async function isInvoiceOwnedByCurrentOsteopath(invoiceId: number): Promise<boolean> {
  try {
    const currentOsteopathId = await getCurrentOsteopathId();
    
    if (!currentOsteopathId) return false;
    
    // Check if the invoice's patient is owned by current osteopath
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
