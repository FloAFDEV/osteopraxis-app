
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

export function adaptAppointmentFromSupabase(data: any): Appointment {
	return {
		id: data.id,
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId,
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
	// CORRECTION: Exclure les colonnes start/end qui n'existent pas dans Supabase
	const supabaseData: any = {
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId,
		date: data.date || data.start, // Utiliser date en priorité, sinon start
		status: data.status,
		reason: data.reason,
		notes: data.notes,
		notificationSent: data.notificationSent || false,
		user_id: data.user_id || null,
	};

	// Filtrer les propriétés undefined pour éviter les erreurs Supabase
	Object.keys(supabaseData).forEach(key => {
		if (supabaseData[key] === undefined) {
			delete supabaseData[key];
		}
	});

	return supabaseData;
}

export function createAppointmentPayload(data: any): CreateAppointmentPayload {
	// CORRECTION: Les colonnes start/end sont pour l'interface, pas pour Supabase
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId || 1,
		osteopathId: data.osteopathId,
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
