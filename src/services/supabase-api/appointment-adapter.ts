
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

export const adaptAppointmentFromSupabase = (data: any): Appointment => {
  // Assurer que tous les champs requis sont présents
  const start = data.start || data.date;
  const end = data.end || (start ? new Date(new Date(start).getTime() + 30 * 60000).toISOString() : null);
  
  return {
    id: data.id,
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    date: data.date || start, // Compatibilité
    start: start,
    end: end,
    status: data.status as AppointmentStatus,
    notes: data.notes || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    reason: data.reason || "",
    notificationSent: data.notificationSent || false,
    user_id: data.user_id || null,
  };
};

export const adaptAppointmentToSupabase = (appointment: Partial<Appointment>): any => {
  // Pour les champs date, start et end, assurons qu'ils sont définis pour Supabase
  const date = appointment.date || appointment.start;
  const start = appointment.start || date;
  const end = appointment.end || (start ? new Date(new Date(start).getTime() + 30 * 60000).toISOString() : null);
  
  // Convertir l'appointment pour l'envoi à Supabase
  const payload: any = {
    ...appointment,
    date: date,
    start: start,
    end: end,
    // Si le statut est "CANCELLED", le convertir en "CANCELED" (orthographe en DB)
    status: appointment.status === "CANCELLED" ? "CANCELED" : appointment.status,
  };

  // Nettoyer les propriétés non nécessaires pour Supabase
  delete payload.id; // Ne pas inclure l'ID lors de la création
  
  return payload;
};

export const createAppointmentPayload = (data: any): CreateAppointmentPayload => {
  // Créer un payload correct pour la création d'un rendez-vous
  const start = data.start || data.date;
  const end = data.end || (start ? new Date(new Date(start).getTime() + 30 * 60000).toISOString() : null);
  
  return {
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    start: start,
    end: end,
    date: start, // S'assurer que le champ date est défini
    status: data.status || "PLANNED",
    notes: data.notes || null,
    reason: data.reason || "",
    notificationSent: data.notificationSent || false,
  };
};
