
// If the file exists already, we'll need to ensure it includes all necessary types
// We'll add the missing types for Appointment and other entities

export type AppointmentStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  notificationSent: boolean;
  notes?: string;
  cabinetId?: number;
  invoiceId?: number;
  plannedTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'CANCELED' | 'CANCELLED';

export interface Invoice {
  id: number;
  patientId: number;
  appointmentId?: number;
  amount: number;
  date: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  tvaExoneration?: boolean;
  tvaMotif?: string;
  Patient?: Patient; // Relation avec le patient (pour les jointures)
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  osteopathId: number;
  professionalProfileId?: number;
  tenant_id?: string;
  createdAt: string;
  updatedAt: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export type UserRole = 'USER' | 'OSTEOPATH' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  osteopathId?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  promoteToAdmin: (userId: string) => Promise<void>;
}

// Type Patient
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender?: 'Homme' | 'Femme' | 'Autre';
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  osteopathId: number;
  cabinetId?: number;
  createdAt: string;
  updatedAt: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  handedness?: 'RIGHT' | 'LEFT' | 'AMBIDEXTROUS';
  hasVisionCorrection: boolean;
  isSmoker: boolean;
  isDeceased: boolean;
  occupation?: string;
  currentTreatment?: string;
  physicalActivity?: string;
  hasChildren?: string;
  childrenAges?: number[];
  contraception?: 'NONE' | 'PILL' | 'IUD' | 'OTHER';
  hdlm?: string; // histoire de la maladie
  generalPractitioner?: string;
  ophtalmologistName?: string;
  digestiveDoctorName?: string;
  digestiveProblems?: string;
  entDoctorName?: string;
  entProblems?: string;
  rheumatologicalHistory?: string;
  surgicalHistory?: string;
  traumaHistory?: string;
  userId?: string;
  avatarUrl?: string;
}

// Interface Osteopath
export interface Osteopath {
  id: number;
  name: string;
  userId: string;
  professional_title?: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard data interface
export interface DashboardData {
  totalPatients: number;
  maleCount: number;
  femaleCount: number;
  averageAge?: number;
  averageAgeMale?: number;
  averageAgeFemale?: number;
  newPatientsThisMonth: number;
  newPatientsThisYear: number;
  newPatientsLastYear?: number;
  appointmentsToday: number;
  totalAppointments?: number;
  completedAppointments?: number;
  canceledAppointments?: number;
  nextAppointment: string;
  patientsLastYearEnd: number;
  newPatientsLast30Days: number;
  thirtyDayGrowthPercentage: number;
  annualGrowthPercentage: number;
  revenue?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  patientDemographics?: {
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
  growthData?: {
    patients: { month: string; count: number }[];
    appointments: { month: string; count: number }[];
  };
  monthlyGrowth: {
    month: string;
    patients: number;
    prevPatients: number;
    growthText: string;
  }[];
}
