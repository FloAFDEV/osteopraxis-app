
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from "@/types";

export function adaptAppointmentFromSupabase(data: any): Appointment {
	return {
		id: data.id,
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId,
		start: data.date, // Utiliser date comme start
		status: data.status as AppointmentStatus,
		notes: data.notes,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		date: data.date,
		reason: data.reason,
	};
}

export function adaptAppointmentToSupabase(data: CreateAppointmentPayload | Partial<Appointment>): any {
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId,
		osteopathId: data.osteopathId,
		date: data.date,
		status: data.status,
		reason: data.reason,
		notes: data.notes,
	};
}

export function createAppointmentPayload(data: any): CreateAppointmentPayload {
	return {
		patientId: data.patientId,
		cabinetId: data.cabinetId || 1,
		osteopathId: data.osteopathId,
		date: data.date,
		reason: data.reason,
		status: data.status || "SCHEDULED",
		notes: data.notes,
	};
}
