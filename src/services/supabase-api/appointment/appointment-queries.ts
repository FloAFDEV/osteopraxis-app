
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

    // Briser la chaîne d'inférence pour éviter l'erreur TS2589
    const response = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });
    
    // Cast explicite pour éviter l'inférence de type profonde
    const { data, error } = response as {
      data: AppointmentRow[] | null;
      error: any;
    };

    if (error) throw error;
    
    // Éviter les assertions de type complexes
    const appointments: Appointment[] = [];
    for (const item of (data || [])) {
      appointments.push(adaptAppointmentFromSupabase(item));
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

    // Briser la chaîne d'inférence pour éviter l'erreur TS2589
    const response = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .single();

    // Cast explicite pour éviter l'inférence de type profonde
    const { data, error } = response as {
      data: AppointmentRow | null;
      error: any;
    };

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

    // Briser la chaîne d'inférence pour éviter l'erreur TS2589
    const response = await supabase
      .from("Appointment")
      .select("id, date, reason, status, patientId, notes, notificationSent, cabinetId")
      .eq("patientId", patientId)
      .eq("osteopathId", osteopathId)
      .order("date", { ascending: true });

    // Cast explicite pour éviter l'inférence de type profonde
    const { data, error } = response as {
      data: AppointmentRow[] | null;
      error: any;
    };

    if (error) throw error;
    
    // Éviter les assertions de type complexes avec une boucle plus explicite
    const appointments: Appointment[] = [];
    for (const item of (data || [])) {
      appointments.push(adaptAppointmentFromSupabase(item));
    }
    return appointments;
  } catch (error) {
    console.error("Error in getAppointmentsByPatientId:", error);
    throw error;
  }
}
