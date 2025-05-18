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

export type Role = "ADMIN" | "OSTEOPATH";

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string | null;
  email: string | null;
  siret: string | null;
  iban: string | null;
  bic: string | null;
  country: string;
  osteopathId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  bloodType: "A_POS" | "A_NEG" | "B_POS" | "B_NEG" | "AB_POS" | "AB_NEG" | "O_POS" | "O_NEG" | null;
  medicalHistory: string | null;
  allergies: string | null;
  medications: string | null;
  osteopathId: string | number | null;
  cabinetId: number | null;
  createdAt: string;
  updatedAt: string;
	userId: string | null;
  complementaryExams: string | null;
  generalSymptoms: string | null;
  pregnancyHistory: string | null;
  birthDetails: string | null;
  developmentMilestones: string | null;
  sleepingPattern: string | null;
  feeding: string | null;
  behavior: string | null;
  childCareContext: string | null;
  isExSmoker: boolean | null;
  smokingSince: string | null;
  smokingAmount: string | null;
  quitSmokingDate: string | null;

  // Nouveaux champs généraux
  ent_followup: string | null;
  intestinal_transit: string | null;
  sleep_quality: string | null;
  fracture_history: string | null;
  dental_health: string | null;
  sport_frequency: string | null;
  gynecological_history: string | null;
  other_comments_adult: string | null;

  // Nouveaux champs spécifiques aux enfants
  fine_motor_skills: string | null;
  gross_motor_skills: string | null;
  weight_at_birth: string | null;
  height_at_birth: string | null;
  head_circumference: string | null;
  apgar_score: string | null;
  childcare_type: string | null;
  school_grade: string | null;
  pediatrician_name: string | null;
  paramedical_followup: string | null;
  other_comments_child: string | null;
}

export interface Appointment {
  id: number;
  patientId: number;
  cabinetId: number;
  osteopathId: number;
  start: string;
  end: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = "PLANNED" | "CONFIRMED" | "CANCELLED" | "DONE";

export interface Invoice {
  id: number;
  patientId: number;
  cabinetId: number;
  osteopathId: number;
  appointmentId: number | null;
  date: string;
  number: string;
  status: InvoiceStatus;
  totalAmount: number;
  paymentDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELLED";

export interface Osteopath {
  id: number;
  userId: string;
  name: string;
  professional_title: string;
  adeli_number: string | null;
  siret: string | null;
  ape_code: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  message?: string;
  needsProfileSetup?: boolean;
}
