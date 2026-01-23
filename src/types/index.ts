export interface User {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: "ADMIN" | "OSTEOPATH";
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
	userId?: string | null;
	website?: string | null;
}

export interface Patient {
	id: number | string;
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
	contraception_notes?: string | null;
	relationship_type?: string | null;
	relationship_other?: string | null;
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

	// Champs cliniques ajoutés (nouveaux)
	diagnosis?: string | null;
	medical_examination?: string | null;
	treatment_plan?: string | null;
	consultation_conclusion?: string | null;

	// Nouveaux champs historiques et examens par sphère
	cardiac_history?: string | null;
	pulmonary_history?: string | null;
	pelvic_history?: string | null;
	neurological_history?: string | null;
	neurodevelopmental_history?: string | null;
	cranial_nerve_exam?: string | null;
	dental_exam?: string | null;
	cranial_exam?: string | null;
	lmo_tests?: string | null;
	cranial_membrane_exam?: string | null;
	musculoskeletal_history?: string | null;
	lower_limb_exam?: string | null;
	upper_limb_exam?: string | null;
	shoulder_exam?: string | null;
	scoliosis?: string | null;
	facial_mask_exam?: string | null;
	fascia_exam?: string | null;
	vascular_exam?: string | null;
}

export interface Appointment {
	id: number | string;
	patientId: number | string;
	cabinetId: number;
	osteopathId: number;
	date: string; // Timestamp de début de la séance - seule colonne réelle en DB
	status: AppointmentStatus;
	reason: string;
	notes: string | null;
	notificationSent: boolean;
	createdAt: string;
	updatedAt: string;
	user_id?: string | null;
	// Propriétés calculées côté client (pas dans la DB)
	start?: string; // Calculé à partir de 'date'
	end?: string;   // Calculé à partir de 'date' + durée
}

// Changed from enum to type union for better compatibility
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED" | "RESCHEDULED" | "NO_SHOW";

// Type d'entrée pour créer un rendez-vous - aligné avec la structure DB
export interface CreateAppointmentPayload {
	patientId: number | string;
	cabinetId: number;
	osteopathId: number;
	date: string; // Timestamp de début de la séance - seule colonne réelle en DB
	reason: string;
	status: AppointmentStatus;
	notificationSent: boolean;
	notes?: string | null;
	createdAt?: string;
	updatedAt?: string;
	website?: string; // Ajouté pour le honeypot dans le formulaire
	user_id?: string | null;
	// Propriétés optionnelles pour compatibilité interface client
	start?: string; // Calculé côté client
	end?: string;   // Calculé côté client
}

// Interface Invoice mise à jour pour correspondre exactement à la base de données
export interface Invoice {
	id: number;
	date: string;
	amount: number;
	paymentStatus: PaymentStatus;
	appointmentId?: number | null;
	patientId: number;
	tvaExoneration?: boolean | null;
	tvaMotif?: string | null;
	notes?: string | null;
	paymentMethod?: string | null;
	cabinetId?: number | null;
	createdAt?: string;
	updatedAt?: string;
	osteopathId?: number | null; // <-- Ajouté pour correction TS
	// Champs calculés côté client pour la compatibilité avec l'UI
	Patient?: {
		firstName: string;
		lastName: string;
	};
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELED";
export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export type OsteopathStatus = 'demo' | 'active' | 'blocked';

export interface Osteopath {
	id: number;
	userId: string;
	name: string;
	professional_title: string;
	rpps_number: string | null;
	siret: string | null;
	ape_code: string | null;
	stampUrl?: string;
	plan: 'light' | 'full' | 'pro';
	status: OsteopathStatus;
	demo_started_at: string;
	activated_at: string | null;
	blocked_at: string | null;
	blocked_reason: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface OsteopathStatusHistory {
	id: number;
	osteopath_id: number;
	old_status: OsteopathStatus | null;
	new_status: OsteopathStatus;
	changed_by: string | null;
	reason: string | null;
	created_at: string;
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
	revenueThisMonth: number;
	revenueLastMonth?: number;
	revenueThisYear?: number;
	revenueLastYear?: number;
	revenueTrend?: number;
	annualTrend?: number;
	averageRevenuePerAppointment?: number;
	pendingInvoices: number;
	pendingAmount?: number;
	weeklyAppointments: number[];
	monthlyRevenue: number[];
	completedAppointments: number;
	// Nouvelles métriques de consultation
	consultationsThisMonth: number;
	consultationsLastMonth: number;
	averageConsultationsPerDay: number;
	averageConsultationsPerMonth: number;
	consultationsTrend: number;
	consultationsLast7Days: { day: string; consultations: number }[];
	consultationsLast12Months: { month: string; consultations: number }[];
}

// Ajout des types pour les devis
export interface Quote {
	id: number;
	patientId: number;
	osteopathId: number;
	cabinetId?: number | null;
	title: string;
	description?: string | null;
	amount: number;
	validUntil: string;
	status: QuoteStatus;
	notes?: string | null;
	createdAt: string;
	updatedAt: string;
	items?: QuoteItem[];
	Patient?: {
		firstName: string;
		lastName: string;
	};
}

export interface QuoteItem {
	id: number;
	quoteId: number;
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface CreateQuotePayload {
	patientId: number;
	osteopathId: number;
	cabinetId?: number | null;
	title: string;
	description?: string | null;
	amount: number;
	validUntil: string;
	status: QuoteStatus;
	notes?: string | null;
	items?: Omit<QuoteItem, 'id' | 'quoteId'>[];
}

// ===========================================================================
// Types pour Compte-Rendu Ostéopathique (CR)
// ===========================================================================

export interface ConsultationReport {
	id: number;
	patientId: number;
	appointmentId: number | null;
	osteopathId: number;
	date: string;

	// Anamnèse de la séance
	chiefComplaint: string; // Motif principal de consultation
	historyOfPresentIllness: string | null; // Histoire de la maladie actuelle
	painScale: number | null; // Échelle douleur 0-10

	// Examen clinique
	observation: string | null; // Observation statique/dynamique
	palpation: string | null; // Palpation
	mobility: string | null; // Tests de mobilité

	// Tests et diagnostic
	testsPerformed: string[] | null; // Tests effectués
	diagnosis: string | null; // Diagnostic ostéopathique

	// Traitement
	techniquesUsed: string[] | null; // Techniques utilisées
	treatmentNotes: string | null; // Notes détaillées du traitement
	treatmentAreas: string[] | null; // Zones traitées (cervicales, dorsales, lombaires, etc.)

	// Conclusion
	outcome: string | null; // Résultat immédiat post-séance
	recommendations: string | null; // Conseils au patient
	nextAppointmentSuggested: string | null; // Date suggérée prochain RDV

	// Métadonnées
	createdAt: string;
	updatedAt: string;

	// Relations optionnelles
	patient?: Patient;
	appointment?: Appointment;
}

export interface CreateConsultationReportPayload {
	patientId: number;
	appointmentId?: number | null;
	osteopathId: number;
	date: string;
	chiefComplaint: string;
	historyOfPresentIllness?: string;
	painScale?: number;
	observation?: string;
	palpation?: string;
	mobility?: string;
	testsPerformed?: string[];
	diagnosis?: string;
	techniquesUsed?: string[];
	treatmentNotes?: string;
	treatmentAreas?: string[];
	outcome?: string;
	recommendations?: string;
	nextAppointmentSuggested?: string;
}

// Bibliothèque de techniques ostéopathiques pré-définies
export const OSTEOPATHY_TECHNIQUES = [
	'HVLA (High Velocity Low Amplitude)',
	'Myotensif',
	'Fonctionnel',
	'Crânien',
	'Viscéral',
	'Structurel',
	'Fascial',
	'Strain/Counterstrain',
	'Energy musculaire',
	'Pompage',
	'Stretching',
	'Mobilisation articulaire',
] as const;

export const TREATMENT_AREAS = [
	'Crâne',
	'Cervicales',
	'Dorsales',
	'Lombaires',
	'Sacrum/Coccyx',
	'Côtes',
	'Épaule',
	'Coude',
	'Poignet/Main',
	'Hanche',
	'Genou',
	'Cheville/Pied',
	'Viscères',
	'ATM (mâchoire)',
] as const;

// ===========================================================================
// Types pour Facturation en mode DEMO
// ===========================================================================

export type InvoiceMode = 'demo' | 'active';

// Extension de l'interface Invoice existante pour ajouter le mode
export interface InvoiceWithMode extends Invoice {
	mode: InvoiceMode; // Mode de la facture
	isDemoWatermarked: boolean; // PDF généré avec filigrane DEMO
}

export interface InvoicePDFOptions {
	mode: InvoiceMode;
	watermark?: {
		enabled: boolean;
		text: string;
		opacity: number;
	};
	legalNotice?: string; // Mention légale (DEMO ou officielle)
}

// Export des types de relation patient pour faciliter l'import
export * from "./patient-relationship";

