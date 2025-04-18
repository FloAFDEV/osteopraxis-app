
// Update the Appointment type
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

// Update the Cabinet type
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

// Update the ProfessionalProfile type
export interface ProfessionalProfile {
  id: number;
  userId: string;
  name: string;
  title: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  profession_type: 'osteopathe' | 'chiropracteur' | 'autre';
  createdAt: string;
  updatedAt: string;
}

// Add DashboardData type
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
