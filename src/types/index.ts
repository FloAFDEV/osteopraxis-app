export type UserRole = 'USER' | 'ADMIN';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
export type AppointmentStatus = 'PLANNED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Invoice {
  id: number;
  patientId: number;
  cabinetId: number;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  cabinetId: number;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'Homme' | 'Femme' | 'Autre';
export type MaritalStatus = 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)';
export type Handedness = 'Droite' | 'Gauche';
export type Contraception = 'Aucun' | 'Pilule' | 'DIU' | 'IMPLANTS';

// Modifier le type Osteopath en ProfessionalProfile
export type ProfessionType = 'osteopathe' | 'chiropracteur' | 'autre';

export interface ProfessionalProfile {
  id: number;
  name: string;
  title: string; // Anciennement professional_title
  userId: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  createdAt: string;
  updatedAt: string;
  profession_type: ProfessionType;
}

// Pour la compatibilité, aliasez Osteopath à ProfessionalProfile
export type Osteopath = ProfessionalProfile;

// Utilisez professionalProfileId au lieu de osteopathId dans User
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  professionalProfileId?: number; // Modifié de osteopathId
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Mettre à jour Patient pour utiliser professionalProfileId
export interface Patient {
  id: number;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  gender: Gender;
  birthDate?: string;
  maritalStatus?: MaritalStatus;
  occupation?: string;
  hasChildren?: boolean;
  childrenAges?: string;
  generalPractitioner?: string;
  surgicalHistory?: string;
  traumaHistory?: string;
  rheumatologicalHistory?: string;
  currentTreatment?: string;
  handedness?: Handedness;
  hasVisionCorrection?: boolean;
  ophtalmologistName?: string;
  entProblems?: string;
  entDoctorName?: string;
  digestiveProblems?: string;
  digestiveDoctorName?: string;
  physicalActivity?: string;
  isSmoker?: boolean;
  isDeceased?: boolean;
  contraception?: Contraception;
  hdlm?: string;
  avatarUrl?: string;
  cabinetId?: number;
  userId?: string;
  professionalProfileId: number; // Modifié de osteopathId
}

// Mettre à jour Cabinet pour utiliser professionalProfileId
export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  professionalProfileId: number; // Modifié de osteopathId
}
