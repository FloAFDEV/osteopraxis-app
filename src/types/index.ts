
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
	role: "ADMIN" | "OSTEOPATH" | "PATIENT";
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

export interface Osteopath {
	id: number;
	name: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
	authId?: string | null;
	siret?: string | null;
	adeli_number?: string | null;
	ape_code?: string | null;
	professional_title?: string | null;
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
	cabinetId?: number | null;
	currentTreatment?: string | null;
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
	paymentStatus: "PAID" | "PENDING" | "CANCELED";
	paymentMethod: "Cash" | "Card" | "Check" | "Other";
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	tenant_id?: string;
	tvaExoneration?: boolean;
	tvaMotif?: string | null;
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

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface DashboardData {
  totalPatients: number;
  appointmentsToday: number;
  revenueThisMonth: number;
  pendingInvoices: number;
  weeklyAppointments: Array<{
    name: string;
    appointments: number;
  }>;
  monthlyRevenue: Array<{
    name: string;
    revenue: number;
  }>;
  patientsByAge: Array<{
    range: string;
    count: number;
  }>;
  patientsByGender: Array<{
    gender: string;
    count: number;
    percentage: number;
  }>;
  recentAppointments: Appointment[];
  
  // Additional properties needed by components
  nextAppointment?: string | null;
  thirtyDayGrowthPercentage?: number;
  newPatientsThisMonth?: number;
  newPatientsLast30Days?: number;
  annualGrowthPercentage?: number;
  newPatientsThisYear?: number;
  maleCount?: number;
  femaleCount?: number;
  childrenCount?: number;
  monthlyGrowth?: Array<{
    month: string;
    patients: number;
    growthText: string;
  }>;
  newPatientsLastYear?: number;
}
