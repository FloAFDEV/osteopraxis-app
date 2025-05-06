export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  medicalHistory?: string;
  notes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  hdlm?: string;
  // Propriétés additionnelles pour la fiche patient
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
  hasChildren?: boolean | string;
  isSmoker?: boolean;
  isDeceased?: boolean;
  hasVisionCorrection?: boolean;
  childrenAges?: number[];
  maritalStatus?: string;
  contraception?: string;
  physicalActivity?: string;
  handedness?: string;
  generalPractitioner?: string;
  ophtalmologistName?: string;
  entDoctorName?: string;
  entProblems?: string;
  digestiveDoctorName?: string;
  digestiveProblems?: string;
  surgicalHistory?: string;
  traumaHistory?: string;
  rheumatologicalHistory?: string;
  currentTreatment?: string;
  osteopathId?: number;
  cabinetId?: number;
  userId?: string;
}

export type AppointmentStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "CANCELLED" | "RESCHEDULED" | "NO_SHOW";

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  notificationSent: boolean;
  notes?: string;
  cabinetId?: number;
  createdAt?: string;
  updatedAt?: string;
  user_id?: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
  notes?: string;
  imageUrl?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  osteopathId?: number;
  tenant_id?: string;
  professionalProfileId?: number;
}

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface Invoice {
  id: number;
  patientId: number;
  cabinetId: number;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  amount: number;
  amountPaid?: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  Patient?: any;
  paymentStatus: PaymentStatus;
  tvaExoneration?: boolean;
  tvaMotif?: string;
  appointmentId?: number;
  invoiceId?: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  osteopathId?: number;
}

export interface Osteopath {
  id: number;
  userId: string;
  name: string;
  professional_title?: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OsteopathProfile {
  id: string; // Correspond à l'ID de l'utilisateur
  firstName: string;
  lastName: string;
  cabinetId?: number;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  specialties?: string[];
  services?: string[];
  education?: string[];
  certifications?: string[];
  awards?: string[];
  publications?: string[];
}

// Ajout de l'interface DashboardData pour résoudre les erreurs d'importation
export interface DashboardData {
  totalPatients: number;
  newPatientsThisMonth: number;
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  patientDemographics: {
    age: {
      under18: number;
      adults18to30: number;
      adults31to45: number;
      adults46to60: number;
      adults61plus: number;
    };
    gender: {
      male: number;
      female: number;
      other: number;
    };
  };
  growthData: {
    patients: Array<{ month: string; count: number }>;
    appointments: Array<{ month: string; count: number }>;
  };
  
  // Propriétés additionnelles pour résoudre les erreurs
  maleCount: number;
  femaleCount: number;
  averageAge: number;
  averageAgeMale: number;
  averageAgeFemale: number;
  newPatientsThisYear: number;
  newPatientsLastYear: number;
  appointmentsToday: number;
  nextAppointment: string;
  patientsLastYearEnd: number;
  newPatientsLast30Days: number;
  thirtyDayGrowthPercentage: number;
  annualGrowthPercentage: number;
  monthlyGrowth: Array<{
    month: string;
    patients: number;
    prevPatients: number;
    growthText: string;
  }>;
}

// Types pour le module de gestion des séances
export type SessionStatus = AppointmentStatus;

export interface Session extends Appointment {
  plannedTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  lastEditedAt?: string;
  autoSaved?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
