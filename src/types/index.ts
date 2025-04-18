
// Appointment types
export type AppointmentStatus = 'PLANNED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  startTime: string;
  endTime: string;
  cabinetId?: number;
  status: AppointmentStatus;
  reason?: string;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cabinet types
export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  imageUrl?: string;
  professionalProfileId: number;
  createdAt: string;
  updatedAt: string;
}

// ProfessionalProfile types
export type ProfessionType = 'osteopathe' | 'chiropracteur' | 'autre';

export interface ProfessionalProfile {
  id: number;
  userId: string;
  name: string;
  title: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  profession_type: ProfessionType;
  createdAt: string;
  updatedAt: string;
}

// Pour la rétrocompatibilité - mise à jour pour correspondre à ProfessionalProfile
export interface Osteopath extends ProfessionalProfile {}

// Patient types
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type Handedness = 'RIGHT' | 'LEFT' | 'AMBIDEXTROUS';
export type Contraception = 'PILL' | 'IUD' | 'IMPLANT' | 'CONDOM' | 'OTHER' | 'NONE';

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  gender?: Gender;
  professionalProfileId: number;
  cabinetId?: number;
  currentTreatment?: string;
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
  hasChildren?: string;
  childrenAges?: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  maritalStatus?: MaritalStatus;
  handedness?: Handedness;
  hasVisionCorrection?: boolean;
  isSmoker?: boolean;
  isDeceased?: boolean;
  contraception?: Contraception;
  hdlm?: string;
  userId?: string;
}

// User types
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: Role;
  professionalProfileId?: number;
  created_at: string;
  updated_at: string;
  avatar_url?: string; // Add this property since it's used in the sidebar
}

// Invoice types
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

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

// Dashboard data types
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

// Chart types
export interface GenderChartData {
  name: string;
  value: number;
  percentage: number;
  icon: JSX.Element;
}

// Pour l'authentification
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token?: string;
}

// Props pour les composants dashboard
export interface DemographicsCardProps {
  maleCount: number;
  femaleCount: number;
  otherCount: number;
}

export interface AppointmentsOverviewProps {
  appointmentsToday: number;
  nextAppointment: string;
}

// Adding interface for AppointmentFormProps
export interface AppointmentFormProps {
  patients: any[];
  cabinets?: { id: number; name: string }[];
  defaultValues?: any;
  appointmentId?: number;
  isEditing?: boolean;
  initialDate?: Date;
  onSubmit?: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

// Adding interface for OsteopathProfileFormProps (similar to ProfessionalProfileForm)
export interface OsteopathProfileFormProps {
  defaultValues?: Partial<ProfessionalProfile>;
  osteopathId?: number; 
  profileId?: number;
  isEditing?: boolean;
  onSuccess?: (data: ProfessionalProfile) => void;
}

// Adding properties to AuthContextType
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string; }) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
  updateUser: (userData: User) => void;
  isAdmin?: boolean;
  promoteToAdmin?: (userId: string) => Promise<void>;
}
