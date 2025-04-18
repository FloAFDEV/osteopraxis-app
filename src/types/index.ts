export type AppointmentStatus = 
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type Gender = 
  | 'Homme'
  | 'Femme';

export type MaritalStatus = 
  | 'SINGLE'
  | 'MARRIED'
  | 'DIVORCED'
  | 'WIDOWED'
  | 'SEPARATED'
  | 'ENGAGED'
  | 'PARTNERED';

export type Handedness = 
  | 'LEFT'
  | 'RIGHT'
  | 'AMBIDEXTROUS';

export type Contraception = 
  | 'NONE'
  | 'PILLS'
  | 'CONDOM'
  | 'IMPLANTS'
  | 'DIAPHRAGM'
  | 'IUD'
  | 'INJECTION'
  | 'PATCH'
  | 'RING'
  | 'NATURAL_METHODS'
  | 'STERILIZATION';

export interface Appointment {
  id: number;
  date: string;
  patientId: number;
  reason: string;
  status: AppointmentStatus;
  notificationSent: boolean;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  occupation?: string;
  osteopathId: number;
  createdAt: string;
  updatedAt: string;
  maritalStatus?: MaritalStatus;
  handedness?: Handedness;
  hasChildren?: string;
  childrenAges?: number[];
  contraception?: Contraception;
  isSmoker: boolean;
  isDeceased: boolean;
  userId?: string;
  avatarUrl?: string;
  cabinetId?: number;
  physicalActivity: string | null;
  currentTreatment: string | null;
  digestiveDoctorName: string | null;
  digestiveProblems: string | null;
  entDoctorName: string | null;
  entProblems: string | null;
  generalPractitioner: string | null;
  ophtalmologistName: string | null;
  rheumatologicalHistory: string | null;
  surgicalHistory: string | null;
  traumaHistory: string | null;
  hdlm: string | null;
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
