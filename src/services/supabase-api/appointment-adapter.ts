
import { Appointment, AppointmentStatus } from "@/types";

export const adaptAppointmentFromSupabase = (data: any): Appointment => {
  // S'assurer que tous les champs requis sont présents
  return {
    id: data.id,
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    date: data.date || data.start, // Compatibilité
    start: data.start || data.date, // S'assurer que start est défini
    end: data.end || new Date(new Date(data.start || data.date).getTime() + 30 * 60000).toISOString(), // Par défaut 30 minutes
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

export const createAppointmentPayload = (data: any): any => {
  // Créer un payload correct pour la création d'un rendez-vous
  return {
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    start: data.start || data.date,
    end: data.end || new Date(new Date(data.start || data.date).getTime() + 30 * 60000).toISOString(),
    status: data.status,
    notes: data.notes || null,
    reason: data.reason || "",
    notificationSent: data.notificationSent || false,
  };
};
