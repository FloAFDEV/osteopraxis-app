
import { supabase } from "../utils";
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

    // Utilisation d'un type simple et explicite pour éviter l'erreur d'instanciation excessive
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true }) as { data: any[] | null; error: any };

    if (error) throw error;
    
    return (data || []).map((item: any) => adaptAppointmentFromSupabase(item));
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
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single() as { data: any; error: any };

    if (error) {
      console.error("Error fetching appointment:", error);
      return null;
    }

    return adaptAppointmentFromSupabase(data);
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
      .select("*")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true }) as { data: any[] | null; error: any };

    if (error) throw error;
    
    return (data || []).map((item: any) => adaptAppointmentFromSupabase(item));
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
