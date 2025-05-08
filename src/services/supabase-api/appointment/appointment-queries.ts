
import { supabase } from "@/integrations/supabase/client";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { Appointment } from "@/types";
import { getCurrentUserOsteopathId } from "./appointment-utils";
import { AppointmentStatus } from "./appointment-types";

// Définir un type simple pour les lignes retournées par la base de données
// Éviter les types complexes pour éviter la récursion infinie
type AppointmentRow = {
  id: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  patientId: number;
  notes?: string | null;
  notificationSent: boolean;
  cabinetId?: number | null;
};

/**
 * Get all appointments for the current osteopath
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    const { data, error } = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });

    if (error) throw error;
    
    // Convertir les données en utilisant un simple casting au lieu d'un generics complexe
    return (data || []).map((item) => adaptAppointmentFromSupabase(item));
  } catch (error) {
    console.error("Error in getAppointments:", error);
    throw error;
  }
}

/**
 * Get a specific appointment by ID
 */
export async function getAppointmentById(id: number): Promise<Appointment | null> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    const { data, error } = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single();

    if (error) {
      console.error("Error fetching appointment:", error);
      return null;
    }

    // Simplifier l'assertion de type
    return data ? adaptAppointmentFromSupabase(data) : null;
  } catch (error) {
    console.error("Error in getAppointmentById:", error);
    return null;
  }
}

/**
 * Get appointments for a specific patient
 */
export async function getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    const { data, error } = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });

    if (error) throw error;
    
    // Simplifier l'assertion de type
    return (data || []).map((item) => adaptAppointmentFromSupabase(item));
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
