
import { supabase } from "@/integrations/supabase/client";
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

    // Using explicit type casting to break dependency on deep Supabase types
    const response = await supabase
      .from("Appointment")
      .select("*")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true }) as unknown as {
        data: AppointmentRow[] | null;
        error: any;
      };
      
    if (response.error) throw response.error;
    
    const appointments = response.data || [];
    return appointments.map(adaptAppointmentFromSupabase);
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

    // Using explicit type casting to break dependency on deep Supabase types
    const response = await supabase
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single() as unknown as {
        data: AppointmentRow | null;
        error: any;
      };

    if (response.error) {
      console.error("Error fetching appointment:", response.error);
      return null;
    }
    
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

    // Using explicit type casting to break dependency on deep Supabase types
    const response = await supabase
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true }) as unknown as {
        data: AppointmentRow[] | null;
        error: any;
      };

    if (response.error) throw response.error;
    
    const appointments = response.data || [];
    return appointments.map(adaptAppointmentFromSupabase);
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
