
import { supabase } from "@/integrations/supabase/client";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { Appointment, AppointmentStatus } from "@/types";
import { getCurrentUserOsteopathId } from "./appointment-utils";

// Define a type for the database response structure
type AppointmentRow = {
  id: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  patientId: number;
  osteopathId: number;
  notes?: string | null;
  notificationSent: boolean;
  cabinetId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Get all appointments for the current osteopath
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    // Use explicit field selection and proper typing with .returns()
    const { data, error } = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true })
      .returns<AppointmentRow[]>();

    if (error) throw error;
    
    return (data || []).map(item => adaptAppointmentFromSupabase(item));
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
      .single()
      .returns<AppointmentRow>();

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
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true })
      .returns<AppointmentRow[]>();

    if (error) throw error;
    
    return (data || []).map(item => adaptAppointmentFromSupabase(item));
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
