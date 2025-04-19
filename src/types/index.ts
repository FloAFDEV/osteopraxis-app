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
  gender: "Male" | "Female" | "Other";
  medicalHistory: string;
  professionalProfileId: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface ProfessionalProfileFormProps {
  defaultValues?: ProfessionalProfile;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (updatedProfile: ProfessionalProfile) => Promise<void> | void;
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
