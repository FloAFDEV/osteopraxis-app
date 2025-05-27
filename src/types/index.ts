export interface User {
	id: number;
	auth_id: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	address: string;
	city: string;
	zip: string;
	country: string;
	createdAt: string;
	updatedAt: string;
	role: "admin" | "osteopath" | "patient";
	status: "active" | "inactive" | "pending";
	avatarUrl: string | null;
	website: string | null;
	siret: string | null;
	adeli_number: string | null;
	ape_code: string | null;
	professionalProfileId: number | null;
	tenant_id?: string;
	osteopathId?: number | null;
}

export interface Patient {
	id: number;
	firstName: string;
	lastName: string;
	birthDate: string | null;
	gender: "Homme" | "Femme" | "Autre" | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	city: string | null;
	zip: string | null;
	country: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	userId: number | null;
	emergencyContactName: string | null;
	emergencyContactPhone: string | null;
	bloodType:
		| "A+"
		| "A-"
		| "B+"
		| "B-"
		| "AB+"
		| "AB-"
		| "O+"
		| "O-"
		| "Unknown"
		| null;
	height: number | null;
	weight: number | null;
	medicalHistory: string | null;
	allergies: string | null;
	avatarUrl: string | null;
	job: string | null;
	maritalStatus:
		| "Single"
		| "Married"
		| "Divorced"
		| "Widowed"
		| "Other"
		| null;
	tenant_id?: string;
	osteopathId?: number | null;
}

export interface ProfessionalProfile {
	id: number;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	tenant_id?: string;
}

export interface Appointment {
	id: number;
	patientId: number;
	cabinetId: number;
	osteopathId: number;
	start: string;
	end: string;
	date: string;
	reason: string;
	status: AppointmentStatus;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	notificationSent: boolean;
	tenant_id?: string;
}

export type AppointmentStatus =
	| "SCHEDULED"
	| "COMPLETED"
	| "CANCELED"
	| "RESCHEDULED"
	| "NO_SHOW";

export interface Invoice {
	id: number;
	patientId: number;
	cabinetId: number;
	appointmentId: number | null;
	date: string;
	dueDate: string;
	amount: number;
	paymentStatus: "PAID" | "UNPAID" | "PARTIALLY_PAID";
	paymentMethod: "Cash" | "Card" | "Check" | "Other";
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	tenant_id?: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  osteopathId: number;
  professionalProfileId?: number;
  logoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  tenant_id?: string;
}
