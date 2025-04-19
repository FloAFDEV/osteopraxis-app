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
export interface Appointment {
  id: number;
  date: string;  // Explicitly string to match API expectations
  patientId: number;
  reason: string;
  status: AppointmentStatus;
  notificationSent: boolean;
  cabinetId?: number;  // Make cabinetId optional
}

export type AppointmentStatus = 
  | "SCHEDULED" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "RESCHEDULED";

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
  consultationId: number;
  amount: number;
  date: string;
  paymentStatus: PaymentStatus;
  Patient?: { // Ajout d'une propriété optionnelle Patient
    firstName: string;
    lastName: string;
  };
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
  }[];
}
