
// Add missing types or update existing ones here to ensure all the properties needed are present

export type Role = 'ADMIN' | 'OSTEOPATH' | 'USER';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
  professionalProfileId?: number;
  avatar_url?: string;
  osteopathId?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  loadStoredToken: () => Promise<AuthState>;
  updateUser: (updatedUserData: User) => void;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  isAdmin: boolean;
  promoteToAdmin: (userId: string) => Promise<void>;
}

// Profession Type
export type ProfessionType = 'osteopathe' | 'chiropracteur' | 'autre';

// Extend ProfessionalProfile type to include all needed fields
export interface ProfessionalProfile {
  id: number;
  name: string;
  userId: string;
  title: string;
  profession_type: ProfessionType;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  imageUrl?: string;
  website?: string;
  description?: string;
  specialties?: string[];
  languages?: string[];
  vat_number?: string;
  bank_account_number?: string;
  iban?: string;
  bic?: string;
}

export interface ProfessionalProfileFormProps {
  defaultValues?: Partial<ProfessionalProfile>;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (profile: ProfessionalProfile) => void;
}

export interface OsteopathProfileFormProps {
  defaultValues?: Partial<ProfessionalProfile>;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (profile: ProfessionalProfile) => void;
}

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
  profession_type?: ProfessionType;
  title?: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  professionalProfileId?: number;
  osteopathId: number;
  logoUrl?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CabinetFormProps {
  defaultValues?: Cabinet;
  cabinetId?: number;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (cabinet: Cabinet) => void;
}

// Gender and Contraception types
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | null;
export type Contraception = 'PILL' | 'IUD' | 'IMPLANT' | 'CONDOM' | 'NONE' | 'OTHER' | null;
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER' | null;
export type Handedness = 'LEFT' | 'RIGHT' | 'AMBIDEXTROUS' | null;

// Add other necessary types for the application
export type AppointmentStatus = "PLANNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Appointment {
  id: number;
  patientId: number;
  cabinetId?: number;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  reason?: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
  notificationSent?: boolean;
}

export interface AppointmentFormProps {
  patients: any[];
  cabinets?: any[];
  defaultValues?: any;
  appointmentId?: number;
  isEditing?: boolean;
  initialDate?: Date;
  onSubmit?: (appointmentData: any) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  hasChildren?: string;
  childrenAges?: number[];
  handedness?: Handedness;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  osteopathId: number;
  cabinetId?: number;
  userId?: string;
  isSmoker?: boolean;
  isDeceased?: boolean;
  hasVisionCorrection?: boolean;
  generalPractitioner?: string;
  currentTreatment?: string;
  contraception?: Contraception;
  traumaHistory?: string;
  surgicalHistory?: string;
  rheumatologicalHistory?: string;
  digestiveProblems?: string;
  entProblems?: string;
  digestiveDoctorName?: string;
  entDoctorName?: string;
  ophtalmologistName?: string;
  physicalActivity?: string;
  hdlm?: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface Invoice {
  id: number;
  patientId: number;
  consultationId: number;
  amount: number;
  date: string;
  paymentStatus: PaymentStatus;
  tvaExoneration?: boolean;
  tvaMotif?: string;
}

export interface Consultation {
  id: number;
  patientId: number;
  osteopathId?: number;
  date: string;
  notes: string;
  isCancelled: boolean;
  cancellationReason?: string;
}

// Dashboard-related types
export interface DashboardData {
  totalPatients: number;
  maleCount?: number;
  femaleCount?: number;
  averageAge?: number;
  averageAgeMale?: number;
  averageAgeFemale?: number;
  newPatientsThisMonth?: number;
  newPatientsThisYear?: number;
  newPatientsLastYear?: number;
  appointmentsToday?: number;
  nextAppointment?: string;
  patientsLastYearEnd?: number;
  newPatientsLast30Days?: number;
  thirtyDayGrowthPercentage?: number;
  annualGrowthPercentage?: number;
  monthlyGrowth?: MonthlyGrowthData[];
}

export interface MonthlyGrowthData {
  month: string;
  patients: number;
  prevPatients: number;
  growthText?: string;
}

export interface AppointmentsOverviewProps {
  appointmentsToday: number;
  nextAppointment: string;
}

// Add any other types that might be needed for components
export interface TreatmentHistory {
  id: number;
  consultationId: number;
  date: string;
  description: string;
}

export interface MedicalDocument {
  id: number;
  patientId: number;
  url: string;
  description: string;
}
