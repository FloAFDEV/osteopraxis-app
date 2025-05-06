
import { AppointmentStatus } from "./index";

// Types pour le module de gestion des séances
export type SessionStatus = AppointmentStatus;

export interface SessionData {
  id: number;
  patientId: number;
  date: string;
  status: SessionStatus;
  notes?: string;
  plannedTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  lastEditedAt?: string;
  autoSaved?: boolean;
}
