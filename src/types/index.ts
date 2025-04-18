
// Appointment types
export type AppointmentStatus = 'PLANNED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  patientId: number;
  date: string;
  startTime: string;
  endTime: string;
  cabinetId?: number;
  status: AppointmentStatus;
  reason?: string;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cabinet types
export interface Cabinet {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  imageUrl?: string;
  professionalProfileId: number;
  createdAt: string;
  updatedAt: string;
}

// ProfessionalProfile types
export type ProfessionType = 'osteopathe' | 'chiropracteur' | 'autre';

export interface ProfessionalProfile {
  id: number;
  userId: string;
  name: string;
  title: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  profession_type: ProfessionType;
  createdAt: string;
  updatedAt: string;
}

// For backward compatibility
export interface Osteopath extends ProfessionalProfile {}

// Patient types 
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  professionalProfileId: number;
  cabinetId?: number;
  currentTreatment?: string;
  occupation?: string;
  physicalActivity?: string;
  generalPractitioner?: string;
  ophtalmologistName?: string;
  entDoctorName?: string;
  entProblems?: string;
  digestiveDoctorName?: string;
  digestiveProblems?: string;
  surgicalHistory?: string;
  traumaHistory?: string;
  rheumatologicalHistory?: string;
  hasChildren?: string;
  childrenAges?: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'USER' | 'ADMIN';
  professionalProfileId?: number;
  created_at: string;
  updated_at: string;
}

// Invoice types
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface Invoice {
  id: number;
  patientId: number;
  consultationId: number;
  amount: number;
  date: string;
  paymentStatus: PaymentStatus;
  tvaExoneration?: boolean;
  tvaMotif?: string;
}

// Dashboard data types
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

// Chart types
export interface GenderChartData {
  name: string;
  value: number;
  percentage: number;
  icon: JSX.Element;
}
