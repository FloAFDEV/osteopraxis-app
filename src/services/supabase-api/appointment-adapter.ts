
import { Appointment, AppointmentStatus } from "@/types";

// Type pour les données d'un rendez-vous venant de Supabase
export type SupabaseAppointment = {
  id: number;
  patientId: number;
  osteopathId: number;
  date: string;
  reason: string;
  status: string;
  notificationSent: boolean;
  notes?: string;
};

/**
 * Adapte les données d'un rendez-vous de Supabase au format attendu par l'application
 */
export function adaptAppointmentFromSupabase(data: any): Appointment {
  return {
    id: data.id,
    patientId: data.patientId,
    date: data.date,
    reason: data.reason || "",
    status: data.status as AppointmentStatus,
    notificationSent: data.notificationSent || false,
    notes: data.notes || ""
  };
}

/**
 * Adapte les données d'un rendez-vous de l'application au format attendu par Supabase
 */
export function adaptAppointmentToSupabase(appointment: Partial<Appointment>): Record<string, any> {
  const result: Record<string, any> = {};
  
  if (appointment.id) result.id = appointment.id;
  if (appointment.patientId !== undefined) result.patientId = appointment.patientId;
  if (appointment.date) result.date = appointment.date;
  if (appointment.reason !== undefined) result.reason = appointment.reason;
  if (appointment.status) result.status = appointment.status;
  if (appointment.notificationSent !== undefined) result.notificationSent = appointment.notificationSent;
  if (appointment.notes !== undefined) result.notes = appointment.notes;
  
  return result;
}
