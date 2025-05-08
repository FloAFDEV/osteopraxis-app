
import { supabase } from "@/integrations/supabase/client";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { Appointment } from "@/types";
import { getCurrentUserOsteopathId } from "./appointment-utils";
import { AppointmentStatus } from "./appointment-types";

/**
 * Get all appointments for the current osteopath
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    // Effectuer la requête sans inférence de type complexe
    const response = await supabase
      .from("Appointment")
      .select("*")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });

    if (response.error) throw response.error;
    
    // Traiter les données sans laisser TypeScript faire d'inférences profondes
    const appointments: Appointment[] = [];
    if (response.data) {
      for (const item of response.data) {
        appointments.push(adaptAppointmentFromSupabase(item));
      }
    }
    
    return appointments;
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

    // Effectuer la requête sans inférence de type complexe
    const response = await supabase
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single();

    if (response.error) {
      console.error("Error fetching appointment:", response.error);
      return null;
    }

    // Éviter l'inférence de type profonde
    return response.data ? adaptAppointmentFromSupabase(response.data) : null;
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

    // Effectuer la requête sans inférence de type complexe
    const response = await supabase
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });

    if (response.error) throw response.error;
    
    // Traiter les données sans laisser TypeScript faire d'inférences profondes
    const appointments: Appointment[] = [];
    if (response.data) {
      for (const item of response.data) {
        appointments.push(adaptAppointmentFromSupabase(item));
      }
    }
    
    return appointments;
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
