
export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  osteopathId?: number; // Adding this property
}

export type Gender = "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme"; // Adding French versions

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
  birthDate?: string; // Adding this for compatibility
  createdAt?: string;
  updatedAt?: string;
  // Adding missing properties used in components
  avatarUrl?: string;
  occupation?: string;
  physicalActivity?: string;
  hasChildren?: string | boolean;
  childrenAges?: number[];
  isSmoker?: boolean;
  hasVisionCorrection?: boolean;
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
  maritalStatus?: string;
  contraception?: string;
  handedness?: string;
  familyStatus?: string;
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
  notes?: string; // Added notes field
}

export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";

export interface Invoice {
  id: number;
  appointmentId?: number;
  patientId: number; // Added missing field
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  tvaMotif?: string;
  tvaExoneration?: boolean; // Added missing field
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
  zip_code?: string; // Changed from postalCode to zip_code
  cabinetId?: number;
  createdAt?: string;
  updatedAt?: string;
  ape_code?: string; // Added missing field
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
  osteopathId?: number; // Added missing field
  imageUrl?: string; // Added missing field
  logoUrl?: string; // Added missing field
}

// Adding DashboardData interface for charts and stats
export interface DashboardData {
  totalPatients: number;
  newPatientsThisMonth: number;
  newPatientsThisYear: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  demographics: {
    male: number;
    female: number;
    other: number;
  };
  ageGroups: {
    label: string;
    value: number;
  }[];
  monthlyGrowth: {
    month: string;
    patients: number;
    prevPatients: number;
  }[];
}
