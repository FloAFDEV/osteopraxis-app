export type Role = "admin" | "osteopath" | "patient";

export type AppointmentStatus =
	| "SCHEDULED"
	| "COMPLETED"
	| "CANCELED"
	| "RESCHEDULED"
	| "NO_SHOW";

export type PaymentStatus = "PENDING" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "osteopath" | "patient";
  created_at: string;
  updated_at?: string;
  osteopathId?: number;
  auth_id?: string;
}

export interface Osteopath {
  id: number;
  userId: string;
  name: string;
  professional_title?: string;
  siret?: string;
  adeli_number?: string;
  ape_code?: string;
  authId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: "Homme" | "Femme" | "MALE" | "FEMALE" | "OTHER";
  occupation?: string;
  notes?: string;
  osteopathId: number;
  cabinetId?: number;
  createdAt: string;
  updatedAt: string;
  weight?: number;
  height?: number;
  bmi?: number;
  avatarUrl?: string;
  allergies?: string;
  currentTreatment?: string;
  hasChildren?: string;
  childrenAges?: string[];
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  generalPractitioner?: string;
  surgicalHistory?: string;
  traumaHistory?: string;
  rheumatologicalHistory?: string;
  medicalHistory?: string;
  currentMedication?: string;
  handedness?: "RIGHT" | "LEFT" | "AMBIDEXTROUS";
  hasVisionCorrection?: boolean;
  ophtalmologistName?: string;
  entProblems?: string;
  entDoctorName?: string;
  digestiveProblems?: string;
  digestiveDoctorName?: string;
  physicalActivity?: string;
  isSmoker?: boolean;
  isExSmoker?: boolean;
  smokingSince?: string;
  smokingAmount?: string;
  quitSmokingDate?: string;
  contraception?: "PILL" | "IUD" | "IMPLANT" | "PATCH" | "RING" | "NONE" | "OTHER";
  familyStatus?: string;
  complementaryExams?: string;
  generalSymptoms?: string;
  pregnancyHistory?: string;
  birthDetails?: string;
  developmentMilestones?: string;
  sleepingPattern?: string;
  feeding?: string;
  behavior?: string;
  childCareContext?: string;
  ent_followup?: string;
  intestinal_transit?: string;
  sleep_quality?: string;
  fracture_history?: string;
  dental_health?: string;
  sport_frequency?: string;
  gynecological_history?: string;
  other_comments_adult?: string;
  other_comments_child?: string;
  weight_at_birth?: number;
  height_at_birth?: number;
  head_circumference?: number;
  fine_motor_skills?: string;
  gross_motor_skills?: string;
  apgar_score?: string;
  childcare_type?: string;
  school_grade?: string;
  pediatrician_name?: string;
  paramedical_followup?: string;
  alcoholConsumption?: string;
  sportActivity?: string;
  hdlm?: string;
  isDeceased?: boolean;
  smoker?: boolean;
  smokerSince?: number;
  userId?: string;
  job?: string;
}

export interface Invoice {
  id: number;
  patientId: number;
  cabinetId?: number;
  appointmentId?: number;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  tvaExoneration?: boolean;
  tvaMotif?: string;
  Patient?: Patient;
}

export interface DashboardData {
  totalPatients: number;
  maleCount: number;
  femaleCount: number;
  childrenCount: number;
  averageAge: number;
  averageAgeMale: number;
  averageAgeFemale: number;
  newPatientsThisMonth: number;
  newPatientsThisYear: number;
  newPatientsLast30Days: number;
  newPatientsLastYear: number;
  thirtyDayGrowthPercentage: number;
  annualGrowthPercentage: number;
  appointmentsToday: number;
  nextAppointment?: string;
  monthlyGrowth: Array<{
    month: string;
    patients: number;
    prevPatients: number;
    growthText: string;
    hommes: number;
    femmes: number;
    enfants: number;
  }>;
  revenueThisMonth: number;
  pendingInvoices: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  totalRevenue: number;
  averageInvoiceAmount: number;
}

export interface Appointment {
  id: number;
  patientId: number;
  cabinetId: number;
  osteopathId: number;
  date: string;
  start: string;
  end: string;
  reason: string;
  notes: string | null;
  status: AppointmentStatus;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
