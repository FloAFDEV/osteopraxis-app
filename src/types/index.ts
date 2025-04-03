
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "PARTNERED" | "ENGAGED";
export type Gender = "Homme" | "Femme" | "Autre";
export type Handedness = "RIGHT" | "LEFT" | "AMBIDEXTROUS";
export type Contraception = "NONE" | "PILLS" | "PATCH" | "RING" | "IUD" | "IMPLANT" | "CONDOM" | "DIAPHRAGM";

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
