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

// Extend ProfessionalProfile type to include all needed fields
export interface ProfessionalProfile {
  id: number;
  name: string;
  userId: string;
  title: string;
  profession_type: 'osteopathe' | 'chiropracteur' | 'autre';
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

// Add other necessary types for the application
export type AppointmentStatus = "PLANNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Appointment {
  id: number;
  patientId: number;
  cabinetId: number;
  date: string;
  startTime: string;
  duration: number;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}
