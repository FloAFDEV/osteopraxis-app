
import { supabase } from "@/integrations/supabase/client";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { Appointment } from "@/types";
import { getCurrentUserOsteopathId } from "./appointment-utils";
import { AppointmentStatus } from "./appointment-types";

// Type intermédiaire simplifié pour éviter l'inférence de type profonde
type RawAppointmentData = {
  id: number;
  date: string;
  reason: string;
  status: string;
  notificationSent: boolean;
  notes?: string | null;
  patientId: number;
  cabinetId?: number | null;
  // Ajoutez d'autres champs si nécessaire, mais gardez-les simples
};

/**
 * Get all appointments for the current osteopath
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    // Utiliser any pour éviter l'inférence de type profonde
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true }) as { data: any[], error: any };

    if (error) throw error;
    
    // Convertir manuellement en utilisant notre adaptateur
    const appointments: Appointment[] = [];
    
    if (data && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const rawItem = data[i] as RawAppointmentData;
        appointments.push(adaptAppointmentFromSupabase(rawItem));
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

    // Utiliser any pour éviter l'inférence de type
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single() as { data: any, error: any };

    if (error) {
      console.error("Error fetching appointment:", error);
      return null;
    }

    // Conversion manuelle contrôlée
    return data ? adaptAppointmentFromSupabase(data as RawAppointmentData) : null;
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

    // Utiliser any pour éviter l'inférence de type
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true }) as { data: any[], error: any };

    if (error) throw error;
    
    // Convertir manuellement avec notre adaptateur
    const appointments: Appointment[] = [];
    
    if (data && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const rawItem = data[i] as RawAppointmentData;
        appointments.push(adaptAppointmentFromSupabase(rawItem));
      }
    }
    
    return appointments;
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
