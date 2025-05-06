// If the file exists already, we'll need to ensure it includes all necessary types
// We'll add the missing types for Appointment and other entities

export type AppointmentStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED'
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

export type PaymentStatus = 'PAID' | 'PENDING' | 'CANCELED';

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

// Add more types as needed
