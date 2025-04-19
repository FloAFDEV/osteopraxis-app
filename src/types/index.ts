
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  last_seen?: string;
  role: "ADMIN" | "OSTEOPATH";
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  professionalProfileId?: number;
}

export interface Patient {
  id: string | number;
  first_name: string;
  last_name: string;
  firstName?: string; // Alias for first_name for backward compatibility
  lastName?: string; // Alias for last_name for backward compatibility
  email?: string;
  phone?: string;
  birth_date?: string;
  birthDate?: string; // Alias for birth_date for backward compatibility
  address?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
  created_at: string;
  createdAt?: string; // Alias for created_at for backward compatibility
  updated_at: string;
  updatedAt?: string; // Alias for updated_at for backward compatibility
  avatarUrl?: string;
  gender?: Gender;
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
  hasChildren?: string;
  childrenAges?: string[];
  professionalProfileId?: number;
  isDeceased?: boolean;
}

export interface Appointment {
  id: string | number;
  patient_id: string | number;
  patientId?: string | number; // Alias for patient_id
  cabinet_id: string | number;
  cabinetId?: string | number; // Alias for cabinet_id
  date: string | Date;
  start_time: string;
  startTime?: string; // Alias for start_time
  end_time: string;
  endTime?: string; // Alias for end_time
  notes?: string;
  reason?: string;
  status?: AppointmentStatus;
  created_at: string;
  updated_at: string;
  duration?: number;
  notificationSent?: boolean;
}

export interface Cabinet {
  id: string | number;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  country: string;
  phone?: string;
  email?: string;
  notes?: string;
  logoUrl?: string;
  imageUrl?: string;
  created_at: string;
  createdAt?: string; // Alias for created_at
  updated_at: string;
  updatedAt?: string; // Alias for updated_at
  professionalProfileId?: number;
}

export interface Invoice {
  id: string | number;
  patient_id: string | number;
  patientId?: string | number; // Alias for patient_id
  cabinet_id: string | number;
  cabinetId?: string | number; // Alias for cabinet_id
  date: string;
  amount: number;
  notes?: string;
  status: "PAID" | "UNPAID" | "PARTIALLY_PAID";
  paymentStatus?: "PAID" | "PENDING" | "CANCELED";
  consultationId?: number;
  tvaExoneration?: boolean;
  tvaMotif?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export type Role = "ADMIN" | "OSTEOPATH";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type AppointmentStatus = "PLANNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type DatabaseAppointmentStatus = "SCHEDULED" | "CANCELED" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
export type Contraception = "PILL" | "CONDOM" | "IMPLANT" | "IUD" | "NONE" | "OTHER" | null;
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER" | null;
export type Handedness = "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null;
export type DbGender = "Homme" | "Femme" | null;
export type DbContraception = "PILLS" | "CONDOM" | "IMPLANTS" | "IUD" | "NONE" | "DIAPHRAGM" | null;
export type DbMaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED" | "ENGAGED" | "PARTNERED" | null;
export type ProfessionType = "osteopathe" | "chiropracteur" | "autre";

export interface Credentials {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
  loadStoredToken: () => Promise<AuthState>;
  updateUser: (updatedUserData: User) => void;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  isAdmin: boolean;
  promoteToAdmin: (userId: string) => Promise<void>;
}

// Additional types needed by components

export interface ProfessionalProfile {
  id: number;
  name: string;
  title?: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  profession_type?: string;
  userId?: string;
  created_at?: string;
  updated_at?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  vat_number?: string;
  bank_account_number?: string;
  iban?: string;
  bic?: string;
}

export interface ProfessionalProfileFormProps {
  defaultValues?: ProfessionalProfile;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (data: ProfessionalProfile) => void;
}

export interface OsteopathProfileFormProps {
  defaultValues?: ProfessionalProfile;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (data: ProfessionalProfile) => void;
}

export interface CabinetFormProps {
  defaultValues?: Cabinet;
  cabinetId?: number | string;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (data: Cabinet) => void;
}

export interface AppointmentFormProps {
  patients?: any[];
  cabinets?: any[];
  defaultValues?: Partial<Appointment>;
  appointmentId?: string | number;
  isEditing?: boolean;
  initialDate?: Date;
  onSubmit?: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export interface AppointmentsOverviewProps {
  appointmentsToday: number;
  nextAppointment: string;
}

export interface DashboardData {
  totalPatients: number;
  maleCount: number;
  femaleCount: number;
  averageAge?: number;
  averageAgeMale?: number;
  averageAgeFemale?: number;
  newPatientsThisMonth: number;
  newPatientsThisYear: number;
  newPatientsLastYear: number;
  appointmentsToday: number;
  nextAppointment: string;
  patientsLastYearEnd: number;
  newPatientsLast30Days: number;
  thirtyDayGrowthPercentage: number;
  annualGrowthPercentage: number;
  monthlyGrowth: MonthlyGrowthData[];
}

export interface MonthlyGrowthData {
  month: string;
  patients: number;
  prevPatients: number;
  growthText: string;
}
