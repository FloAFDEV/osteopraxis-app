export interface User {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	role: Role;
	created_at: string;
	updated_at: string;
	osteopathId: number | null;
}

export type Role = "ADMIN" | "OSTEOPATH";

// Ajout des types manquants
export type Gender = "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme" | null;
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
	| "STERILIZATION"
	| "IUD_HORMONAL";
export interface Cabinet {
	id: number;
	name: string;
	address: string;
	city: string;
	postalCode: string;
	phone: string | null;
	email: string | null;
	siret: string | null;
	iban: string | null;
	bic: string | null;
	country: string;
	osteopathId: number;
	createdAt: string;
	updatedAt: string;
	imageUrl?: string | null;
	logoUrl?: string | null;
	professionalProfileId?: number | null;
	tenant_id?: string | null;
}

export interface Patient {
	id: number;
	firstName: string;
	lastName: string;
	email: string | null;
	phone: string | null;
	birthDate: string | null;
	address: string | null;

	gender: "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme" | null;
	height: number | null;
	weight: number | null;
	bmi: number | null;
	osteopathId: string | number | null;
	cabinetId: number | null;
	createdAt: string;
	updatedAt: string;
	userId: string | null;
	avatarUrl: string | null;
	childrenAges: number[] | null;
	complementaryExams: string | null;
	generalSymptoms: string | null;
	pregnancyHistory: string | null;
	birthDetails: string | null;
	developmentMilestones: string | null;
	sleepingPattern: string | null;
	feeding: string | null;
	behavior: string | null;
	childCareContext: string | null;
	isExSmoker: boolean | null;
	smokingSince: string | null;
	smokingAmount: string | null;
	quitSmokingDate: string | null;

	// Champs ajoutés existants en base de données
	currentTreatment?: string | null;
	hdlm?: string | null;
	hasVisionCorrection?: boolean;
	isSmoker?: boolean;
	isDeceased?: boolean;
	maritalStatus?: string | null;
	occupation?: string | null;
	physicalActivity?: string | null;
	hasChildren?: string | null;
	generalPractitioner?: string | null;
	entProblems?: string | null;
	entDoctorName?: string | null;
	digestiveProblems?: string | null;
	digestiveDoctorName?: string | null;
	ophtalmologistName?: string | null;
	surgicalHistory?: string | null;
	traumaHistory?: string | null;
	rheumatologicalHistory?: string | null;
	handedness?: string | null;
	contraception?: string | null;
	familyStatus?: string | null;

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

	// Champs requis par le type
	allergies: string | null;
}

export interface Appointment {
	id: number;
	patientId: number;
	cabinetId: number;
	osteopathId: number;
	start: string;
	end: string;
	status: AppointmentStatus;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	date: string; // Rendu obligatoire pour compatibilité
	reason: string;
	notificationSent: boolean;
	user_id?: string | null;
}

export enum AppointmentStatus {
	SCHEDULED = "SCHEDULED",
	COMPLETED = "COMPLETED",
	CANCELED = "CANCELED",
	RESCHEDULED = "RESCHEDULED",
	NO_SHOW = "NO_SHOW",
}

// Type d'entrée pour créer un rendez-vous (modification pour résoudre les erreurs)
export interface CreateAppointmentPayload {
	patientId: number;
	cabinetId: number;
	osteopathId: number;
	start: string;
	end: string; // Gardé pour compatibilité avec le code client mais non utilisé en DB
	date: string; // Rendu obligatoire pour compatibilité
	reason: string;
	status: AppointmentStatus;
	notes?: string | null;
	notificationSent: boolean;
	createdAt?: string;
	updatedAt?: string;
	website?: string; // Ajouté pour le honeypot dans le formulaire
}

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

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELED";
export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface Osteopath {
	id: number;
	userId: string;
	name: string;
	professional_title: string;
	adeli_number: string | null;
	siret: string | null;
	ape_code: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
	message?: string;
	needsProfileSetup?: boolean;
}

// Ajout des types manquants pour le dashboard
export interface MonthlyGrowth {
	month: string;
	patients: number;
	prevPatients: number;
	growthText: string;
	hommes: number;
	femmes: number;
	enfants: number;
}

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

export interface MonthlyGrowth {
	month: string;
	patients: number;
	prevPatients: number;
	growthText: string;
	hommes: number;
	femmes: number;
	enfants: number;
}
