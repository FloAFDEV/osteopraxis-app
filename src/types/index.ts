
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
  professionalProfileId?: number;
}

export type Role = "USER" | "ADMIN" | "OSTEOPATH";

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: Gender;
  medicalHistory: string;
  professionalProfileId: number;
  createdAt: string;
  updatedAt: string;
  // Propriétés supplémentaires pour corriger les erreurs
  avatarUrl?: string;
  hasChildren?: string;
  childrenAges?: string[];
  occupation?: string;
  physicalActivity?: string;
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
  isDeceased?: boolean;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: AppointmentStatus;
  professionalProfileId: number;
  createdAt: string;
  updatedAt: string;
  reason?: string; // Ajouté pour compatibilité avec le code existant
  startTime?: string; // Ajouté pour compatibilité avec SchedulePage
  endTime?: string; // Ajouté pour cohérence avec startTime
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  imageUrl: string;
  professionalProfileId: number;
  osteopathId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  patientId: number;
  consultationId: number;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
  // Ajout des propriétés manquantes
  tvaExoneration?: boolean;
  tvaMotif?: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface ProfessionalProfile {
  id: number;
  userId: string;
  name: string;
  title: string;
  profession_type: ProfessionType;
  address: string;
  phone: string;
  email: string;
  website: string;
  siret: string;
  adeli_number: string;
  ape_code: string;
  vat_number: string;
  bank_account_number: string;
  iban: string;
  bic: string;
  logoUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ProfessionType = "osteopathe" | "chiropracteur" | "autre";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

export interface ProfessionalProfileFormProps {
  defaultValues?: ProfessionalProfile;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (updatedProfile: ProfessionalProfile) => Promise<void> | void;
}

export interface CabinetFormProps {
  defaultValues?: Cabinet;
  cabinetId?: number;
  professionalProfileId: number;
  isEditing?: boolean;
  onSuccess?: (updatedCabinet: Cabinet) => Promise<void> | void;
}

export interface OsteopathProfileFormProps {
  defaultValues?: ProfessionalProfile;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (updatedProfile: ProfessionalProfile) => Promise<void> | void;
}

export type AppointmentStatus = 
  | "PLANNED" 
  | "CONFIRMED" 
  | "CANCELLED" 
  | "COMPLETED";

export interface Consultation {
  id: number;
  patientId: number;
  date: string;
  notes: string;
  professionalProfileId: number;
  createdAt: string;
  updatedAt: string;
}

// Types pour les tableaux de bord
export interface DashboardData {
  totalPatients: number;
  newPatients: number;
  upcomingAppointments: number;
  completedAppointments: number;
  malePatients: number;
  femalePatients: number;
  otherPatients: number;
  patientsByAge: {
    [key: string]: number;
  };
}

export interface MonthlyGrowthData {
  month: string;
  patients: number;
}

export interface AppointmentFormProps {
  patients?: Patient[];
  cabinets?: Cabinet[];
  defaultValues?: any;
  appointmentId?: number;
  isEditing?: boolean;
  initialDate?: Date;
  onSubmit?: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export interface AppointmentsOverviewProps {
  upcomingAppointments: Appointment[];
  loading?: boolean;
}

export type Contraception = 
  | "NONE"
  | "PILLS"
  | "CONDOM"
  | "IMPLANT"
  | "DIAPHRAGM"
  | "IUD"
  | "INJECTION"
  | "PATCH"
  | "RING"
  | "NATURAL_METHODS"
  | "STERILIZATION";
