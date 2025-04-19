export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  last_seen?: string;
  role: "ADMIN" | "OSTEOPATH";
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  cabinet_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Cabinet {
  id: string;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  country: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  patient_id: string;
  cabinet_id: string;
  date: string;
  amount: number;
  notes?: string;
  status: "PAID" | "UNPAID" | "PARTIALLY_PAID";
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
