
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

export function adaptAppointmentFromSupabase(data: any): Appointment {
	return {
		id: data.id,
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId,
		date: data.date, // Colonne réelle en DB
		status: data.status as AppointmentStatus,
		reason: data.reason,
		notes: data.notes,
		notificationSent: data.notificationSent || false,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		user_id: data.user_id,
		// Propriétés calculées côté client pour la compatibilité
		start: data.date, // Start = date de début
		end: data.date ? new Date(new Date(data.date).getTime() + 30 * 60000).toISOString() : data.date, // End = début + 30min
	};
}

export function adaptAppointmentToSupabase(data: CreateAppointmentPayload | Partial<Appointment>): any {
	// CORRECTION: Utiliser seulement les colonnes qui existent dans Supabase
	const supabaseData: any = {
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId,
		date: data.date || data.start, // Utiliser date en priorité, sinon start si fourni
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

export function createAppointmentPayload(data: any): any {
	// CORRECTION: Préparer les données pour l'interface client avec start/end calculés
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId || 1,
		osteopathId: data.osteopathId,
		date: data.date || data.start, // Priorité à date
		start: data.start || data.date, // Calculé pour l'interface
		end: data.end || (data.date ? new Date(new Date(data.date).getTime() + 30 * 60000).toISOString() : undefined), // Calculé pour l'interface
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
