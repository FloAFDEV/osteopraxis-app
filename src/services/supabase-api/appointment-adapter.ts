
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

export function adaptAppointmentFromSupabase(data: any): Appointment {
	return {
		id: data.id,
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		// osteopathId n'existe pas dans la table Appointment, on le déduit via Patient si nécessaire
		osteopathId: 1, // Valeur par défaut temporaire
		start: data.date, // Utiliser date comme start
		end: data.date ? new Date(new Date(data.date).getTime() + 30 * 60000).toISOString() : data.date, // Calculer end à partir de date + 30min
		status: data.status as AppointmentStatus,
		notes: data.notes,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		date: data.date,
		reason: data.reason,
		notificationSent: data.notificationSent || false,
		user_id: data.user_id,
	};
}

export function adaptAppointmentToSupabase(data: CreateAppointmentPayload | Partial<Appointment>): any {
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		// Ne pas inclure osteopathId car cette colonne n'existe pas dans Appointment
		date: data.date || data.start,
		status: data.status,
		reason: data.reason,
		notes: data.notes,
		notificationSent: data.notificationSent || false,
		user_id: data.user_id || null,
	};
}

export function createAppointmentPayload(data: any): CreateAppointmentPayload {
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId || 1,
		osteopathId: data.osteopathId || 1, // Peut être utilisé pour validation mais ne sera pas sauvé
		start: data.start || data.date,
		end: data.end || (data.date ? new Date(new Date(data.date).getTime() + 30 * 60000).toISOString() : undefined),
		date: data.date || data.start,
		reason: data.reason,
		status: data.status || "SCHEDULED",
		notes: data.notes,
		notificationSent: data.notificationSent || false,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		website: data.website, // Pour le honeypot
		user_id: data.user_id || null,
	};
}
