
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

/**
 * Adapte les données d'un rendez-vous issues de Supabase vers le format utilisé par l'application
 */
export const adaptAppointmentFromSupabase = (data: any): Appointment => {
  // On utilise uniquement la date de début (date/start) pour calculer l'heure de fin si nécessaire
  const start = data.start || data.date;
  
  return {
    id: data.id,
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    date: data.date || start, // Compatibilité
    start: start,
    // Si la colonne end existe dans les données, on l'utilise, sinon on calcule une fin à 30 minutes du début
    end: data.end || (start ? new Date(new Date(start).getTime() + 30 * 60000).toISOString() : null),
    status: data.status as AppointmentStatus,
    notes: data.notes || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    reason: data.reason || "",
    notificationSent: data.notificationSent || false,
    user_id: data.user_id || null,
  };
};

/**
 * Adapte les données d'un rendez-vous du format application vers le format attendu par Supabase
 */
export const adaptAppointmentToSupabase = (appointment: Partial<Appointment>): any => {
  // Pour les champs date, start et end, assurons qu'ils sont définis pour Supabase
  const date = appointment.date || appointment.start;
  const start = appointment.start || date;
  
  // Convertir l'appointment pour l'envoi à Supabase, sans inclure la propriété end si elle n'existe pas dans la BDD
  const payload: any = {
    ...appointment,
    date: date,
    start: start,
    // Ne pas inclure end si nous décidons de ne pas avoir cette colonne en DB
    // end: appointment.end || (start ? new Date(new Date(start).getTime() + 30 * 60000).toISOString() : null),
    // Si le statut est "CANCELLED", le convertir en "CANCELED" (orthographe en DB)
    status: appointment.status === "CANCELLED" ? "CANCELED" : appointment.status,
  };

  // Nettoyer les propriétés non nécessaires pour Supabase
  delete payload.id; // Ne pas inclure l'ID lors de la création
  
  return payload;
};

/**
 * Crée un payload correct pour la création d'un rendez-vous
 */
export const createAppointmentPayload = (data: any): CreateAppointmentPayload => {
  // Créer un payload correct pour la création d'un rendez-vous
  const start = data.start || data.date;
  
  return {
    patientId: data.patientId,
    cabinetId: data.cabinetId || 1,
    osteopathId: data.osteopathId || 1,
    start: start,
    // Ne pas inclure end dans le payload si la colonne n'existe pas en DB
    // end: data.end || (start ? new Date(new Date(start).getTime() + 30 * 60000).toISOString() : null),
    date: start, // S'assurer que le champ date est défini
    status: data.status || "PLANNED",
    notes: data.notes || null,
    reason: data.reason || "",
    notificationSent: data.notificationSent || false,
  };
};
