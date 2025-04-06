export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "PARTNERED" | "ENGAGED" | "SEPARATED";
export type Gender = "Homme" | "Femme" | "Autre";
export type Handedness = "RIGHT" | "LEFT" | "AMBIDEXTROUS";
export type Contraception = "NONE" | "PILLS" | "PATCH" | "RING" | "IUD" | "IMPLANT" | "CONDOM" | "DIAPHRAGM" | "INJECTION" | "NATURAL_METHODS" | "STERILIZATION";
export type PaymentStatus = "PAID" | "PENDING" | "CANCELED";
export type Role = "ADMIN" | "OSTEOPATH";

export interface Appointment {
  id: number;
  date: string;
  reason: string;
  patientId: number;
  status: AppointmentStatus;
  notificationSent: boolean;
}

export interface Patient {
  id: number;
  userId: string | null;
  osteopathId: number;
  cabinetId: number;
  createdAt: string;
  updatedAt: string;
  address: string;
  avatarUrl: string | null;
  birthDate: string;
  email: string;
  phone: string;
  maritalStatus: MaritalStatus;
  childrenAges: number[];
  physicalActivity: string | null;
  firstName: string;
  lastName: string;
  hasChildren: string;
  contraception: Contraception;
  currentTreatment: string | null;
  digestiveDoctorName: string | null;
  digestiveProblems: string | null;
  entDoctorName: string | null;
  entProblems: string | null;
  gender: Gender;
  generalPractitioner: string | null;
  handedness: Handedness;
  hasVisionCorrection: boolean;
  isDeceased: boolean;
  isSmoker: boolean;
  occupation: string | null;
  ophtalmologistName: string | null;
  rheumatologicalHistory: string | null;
  surgicalHistory: string | null;
  traumaHistory: string | null;
  hdlm: string | null;
}

export interface Osteopath {
  id: number;
  userId: string;
  createdAt: string;
  name: string;
  updatedAt: string;
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  osteopathId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
  osteopathId: number | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface DashboardData {
  totalPatients: number;
  maleCount: number;
  femaleCount: number;
  averageAge: number;
  averageAgeMale: number;
  averageAgeFemale: number;
  newPatientsThisMonth: number;
  newPatientsThisYear: number;
  newPatientsLastYear: number;
  appointmentsToday: number;
  nextAppointment: string;
  patientsLastYearEnd: number;
  newPatientsLast30Days: number;
  thirtyDayGrowthPercentage: number;
  annualGrowthPercentage: number;
  monthlyGrowth: {
    month: string;
    patients: number;
    prevPatients: number;
    growthText: string;
  }[];
}

// Add the missing Invoice type
export interface Invoice {
  id: number;
  patientId: number;
  consultationId: number;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
  Patient?: {
    firstName: string;
    lastName: string;
  };
}
