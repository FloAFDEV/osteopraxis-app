
import { Appointment } from "@/types";

// Union type for appointment status with explicit values
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW" | "RESCHEDULED";

// Base data structure for appointment creation
export interface AppointmentBaseData {
  patientId: number;
  date: string;
  reason: string;
  notificationSent?: boolean;
  notes?: string;
  cabinetId?: number | null;
}

// Data structure for appointment insertion with proper typing
export interface AppointmentInsertData extends AppointmentBaseData {
  status: AppointmentStatus;
  osteopathId: number;
}

// Update structure allows partial fields
export interface AppointmentUpdateData {
  patientId?: number;
  date?: string;
  reason?: string;
  status?: AppointmentStatus;
  notificationSent?: boolean;
  notes?: string;
  cabinetId?: number | null;
}
