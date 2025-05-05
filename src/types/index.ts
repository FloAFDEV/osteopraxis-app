export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  gender: Gender;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED" | "RESCHEDULED" | "NO_SHOW";

export interface Appointment {
  id: number;
  date: string;
  patientId: number;
  status: AppointmentStatus;
  reason: string;
  notificationSent: boolean;
  invoiceId?: number;
  createdAt?: string;
  updatedAt?: string;
  cabinetId?: number;
  notes?: string; // Add notes field to the Appointment interface
}

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface Invoice {
  id: number;
  appointmentId: number;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  tvaMotif?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Osteopath {
  id: number;
  name: string;
  professional_title: string;
  adeli_number: string;
  siret: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  cabinetId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  city: string;
  zip_code: string; // Changed from postalCode to zip_code
  phone?: string;
  email?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}
