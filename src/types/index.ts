
export interface User {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	role: "ADMIN" | "OSTEOPATH";
	created_at: string;
	updated_at: string;
	osteopathId: number | null;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
	message?: string; // Optional message field for auth feedback
}

export type Role = "ADMIN" | "OSTEOPATH";

// Interfaces pour les patients
export interface Patient {
	id: number;
	firstName: string;
	lastName: string;
	email: string | null;
	phone: string | null;
	address: string | null;
	birthDate: string | null;
	gender: Gender | null;
	avatarUrl: string | null;
	createdAt: string;
	updatedAt: string;
	osteopathId: number;
	cabinetId: number | null;
	occupation: string | null;
	maritalStatus: MaritalStatus | null;
	hasChildren: string | null;
	childrenAges: number[] | null;
	generalPractitioner: string | null;
	currentTreatment: string | null;
	isSmoker: boolean;
	isExSmoker?: boolean;
	smokingSince?: string | null;
	smokingAmount?: string | null;
	quitSmokingDate?: string | null;
	physicalActivity: string | null;
	hasVisionCorrection: boolean;
	contraception: Contraception | null;
	handedness: Handedness | null;
	isDeceased: boolean;
	digestiveProblems: string | null;
	digestiveDoctorName: string | null;
	entProblems: string | null;
	entDoctorName: string | null;
	ophtalmologistName: string | null;
	surgicalHistory: string | null;
	traumaHistory: string | null;
	rheumatologicalHistory: string | null;
	hdlm: string | null;
	userId: string | null;
	// Nouveaux champs pour tous les patients
	complementaryExams: string | null;
	generalSymptoms: string | null;
	// Nouveaux champs pour les enfants
	pregnancyHistory: string | null;
	birthDetails: string | null;
	developmentMilestones: string | null;
	sleepingPattern: string | null;
	feeding: string | null;
	behavior: string | null;
	childCareContext: string | null;

	// Nouveaux champs généraux
	ent_followup: string | null;
	intestinal_transit: string | null;
	sleep_quality: string | null;
	fracture_history: string | null;
	dental_health: string | null;
	sport_frequency: string | null;
	gynecological_history: string | null;
	other_comments_adult: string | null;

	// Nouveaux champs spécifiques aux enfants
	fine_motor_skills: string | null;
	gross_motor_skills: string | null;
	weight_at_birth: number | null;
	height_at_birth: number | null;
	head_circumference: number | null;
	apgar_score: string | null;
	childcare_type: string | null;
	school_grade: string | null;
	pediatrician_name: string | null;
	paramedical_followup: string | null;
	other_comments_child: string | null;
}

// Mise à jour des interfaces pour les autres entités pour assurer la cohérence des types
export interface Appointment {
	invoiceId?: number | null;
	id: number;
	date: string;
	patientId: number;
	reason: string;
	status: AppointmentStatus;
	notificationSent: boolean;
	cabinetId?: number;
	notes?: string; // Added field for session report
}

// Enums pour les patients
export type Gender = "Homme" | "Femme";

export type MaritalStatus =
	| "SINGLE"
	| "MARRIED"
	| "DIVORCED"
	| "WIDOWED"
	| "SEPARATED"
	| "ENGAGED"
	| "PARTNERED";

export type Handedness = "LEFT" | "RIGHT" | "AMBIDEXTROUS";

export type Contraception =
	| "NONE"
	| "PILLS"
	| "CONDOM"
	| "IMPLANTS"
	| "DIAPHRAGM"
	| "IUD"
	| "INJECTION"
	| "PATCH"
	| "RING"
	| "NATURAL_METHODS"
	| "STERILIZATION";

// Interface pour les rendez-vous
// Updated to only use "CANCELED" (one L) for consistency
export type AppointmentStatus =
	| "SCHEDULED"
	| "COMPLETED"
	| "CANCELED" // Using single L spelling consistently
	| "RESCHEDULED"
	| "NO_SHOW";

// Interface pour les cabinets
export interface Cabinet {
	id: number;
	name: string;
	address: string;
	phone: string | null;
	email?: string | null;
	imageUrl: string | null;
	logoUrl: string | null;
	osteopathId: number;
	createdAt: string;
	updatedAt: string;
	// Add missing properties
	city?: string;
	zip_code?: string;
	country?: string;
}

// Interface pour les ostéopathes
export interface Osteopath {
	id: number;
	name: string;
	userId: string;
	professional_title: string | null;
	adeli_number: string | null;
	siret: string | null;
	ape_code: string | null;
	createdAt: string;
	updatedAt: string;
}

// Interface pour les factures
export interface Invoice {
	id: number;
	patientId: number;
	appointmentId?: number; // Changed from consultationId to appointmentId, and made optional
	amount: number;
	date: string;
	paymentStatus: PaymentStatus;
	Patient?: {
		firstName: string;
		lastName: string;
	};
	// Nouveaux champs pour les mentions légales françaises
	tvaExoneration?: boolean;
	tvaMotif?: string;
	paymentMethod?: string;
	notes?: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

// Interface pour les données du dashboard
export interface DashboardData {
	totalPatients: number;
	maleCount: number;
	femaleCount: number;
	averageAge: number;
	averageAgeMale: number;
	averageAgeFemale: number;
	newPatientsThisMonth: number;
	newPatientsThisYear: number;
	newPatientsLastYear: number;
	appointmentsToday: number;
	nextAppointment: string;
	patientsLastYearEnd: number;
	newPatientsLast30Days: number;
	thirtyDayGrowthPercentage: number;
	annualGrowthPercentage: number;
	monthlyGrowth: {
		month: string;
		patients: number;
		prevPatients: number;
		growthText: string;
		hommes: number;
		femmes: number;
		enfants: number;
	}[];
	childrenCount?: number;
}

