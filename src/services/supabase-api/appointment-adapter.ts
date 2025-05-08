
import { Appointment, AppointmentStatus } from "@/types";

// Type for Supabase Appointment data
export type SupabaseAppointment = {
  id: number;
  patientId: number;
  osteopathId: number;
  date: string;
  reason: string;
  status: string;
  notificationSent: boolean;
  notes?: string;
  cabinetId?: number;
  createdAt?: string;
  updatedAt?: string;
  user_id?: string;
};

/**
 * Adapts appointment data from Supabase to the application format
 */
export function adaptAppointmentFromSupabase(data: any): Appointment {
  return {
    id: data.id,
    patientId: data.patientId,
    date: data.date,
    reason: data.reason || "",
    status: data.status as AppointmentStatus,
    notificationSent: data.notificationSent || false,
    notes: data.notes || "",
    cabinetId: data.cabinetId || null
  };
}

/**
 * Adapts appointment data from application to Supabase format
 */
export function adaptAppointmentToSupabase(appointment: Partial<Appointment>): Record<string, any> {
  const result: Record<string, any> = {};
  
  if (appointment.id !== undefined) result.id = appointment.id;
  if (appointment.patientId !== undefined) result.patientId = appointment.patientId;
  if (appointment.date !== undefined) result.date = appointment.date;
  if (appointment.reason !== undefined) result.reason = appointment.reason;
  if (appointment.status !== undefined) result.status = appointment.status;
  if (appointment.notificationSent !== undefined) result.notificationSent = appointment.notificationSent;
  if (appointment.notes !== undefined) result.notes = appointment.notes;
  if (appointment.cabinetId !== undefined) result.cabinetId = appointment.cabinetId;
  
  return result;
}
