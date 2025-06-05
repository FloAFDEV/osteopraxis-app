
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

export function adaptAppointmentFromSupabase(data: any): Appointment {
	return {
		id: data.id,
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId, // Maintenant disponible directement
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
	const adaptedData = {
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId, // Maintenant inclus dans les données Supabase
		date: data.date || data.start,
		status: data.status,
		reason: data.reason,
		notes: data.notes,
		notificationSent: data.notificationSent || false,
		user_id: data.user_id || null,
	};

	// Supprimer les valeurs undefined pour éviter les erreurs
	Object.keys(adaptedData).forEach(key => {
		if (adaptedData[key] === undefined) {
			delete adaptedData[key];
		}
	});

	return adaptedData;
}

export function createAppointmentPayload(data: any): CreateAppointmentPayload {
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId || 1,
		osteopathId: data.osteopathId || 1, // Maintenant utilisé réellement
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
