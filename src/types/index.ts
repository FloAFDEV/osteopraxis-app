export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  medicalHistory?: string;
  notes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  hdlm?: string;
}

export type AppointmentStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "CANCELLED" | "RESCHEDULED" | "NO_SHOW";

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  notificationSent: boolean;
  notes?: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
  notes?: string;
}

export interface Invoice {
  id: number;
  patientId: number;
  cabinetId: number;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  amount: number;
  amountPaid?: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface OsteopathProfile {
  id: string; // Correspond à l'ID de l'utilisateur
  firstName: string;
  lastName: string;
  cabinetId?: number;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  specialties?: string[];
  services?: string[];
  education?: string[];
  certifications?: string[];
  awards?: string[];
  publications?: string[];
}
