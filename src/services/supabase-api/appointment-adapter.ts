
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
  // Convertir l'appointment pour l'envoi à Supabase
  const payload: any = {
    ...appointment,
  };

  // Nettoyer les propriétés non nécessaires pour Supabase
  delete payload.id; // Ne pas inclure l'ID lors de la création
  
  return payload;
};

export const createAppointmentPayload = (data: any): CreateAppointmentPayload => {
  // Créer un payload correct pour la création d'un rendez-vous
  const start = data.start || data.date;
  
  return {
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    start: start,
    end: data.end || new Date(new Date(start).getTime() + 30 * 60000).toISOString(),
    date: start, // S'assurer que le champ date est défini
    status: data.status || "PLANNED",
    notes: data.notes || null,
    reason: data.reason || "",
    notificationSent: data.notificationSent || false,
  };
};
