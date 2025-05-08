
import { supabaseRaw } from "@/integrations/supabase/client-raw";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { Appointment } from "@/types";
import { getCurrentUserOsteopathId } from "./appointment-utils";
import { AppointmentStatus } from "./appointment-types";
import { typedData } from "../utils";

// Type simplifié pour les données brutes d'appointment retournées par Supabase
export type AppointmentRow = {
  id: number;
  date: string;
  reason: string;
  status: string;
  notificationSent: boolean;
  notes?: string | null;
  patientId: number;
  cabinetId?: number | null;
  osteopathId: number;
};

/**
 * Get all appointments for the current osteopath
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    const { data, error } = await supabaseRaw
      .from("Appointment")
      .select("*")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });
      
    if (error) throw error;
    
    const appointments = data || [];
    return appointments.map(row => adaptAppointmentFromSupabase(row as AppointmentRow));
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

    const { data, error } = await supabaseRaw
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single();

    if (error) {
      console.error("Error fetching appointment:", error);
      return null;
    }
    
    return data ? adaptAppointmentFromSupabase(data as AppointmentRow) : null;
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

    const { data, error } = await supabaseRaw
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });

    if (error) throw error;
    
    const appointments = data || [];
    return appointments.map(row => adaptAppointmentFromSupabase(row as AppointmentRow));
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
