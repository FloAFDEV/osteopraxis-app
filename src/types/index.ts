export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "ADMIN" | "OSTEOPATH";
  created_at: string;
  updated_at: string;
  osteopathId: number | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  message?: string; // Optional message field for auth feedback
}

export type Role = "ADMIN" | "OSTEOPATH";
