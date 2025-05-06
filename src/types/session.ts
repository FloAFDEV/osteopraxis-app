
import { AppointmentStatus } from "./index";

export type SessionStatus = AppointmentStatus;

export interface SessionFormData {
  id?: number;
  patientId: number;
  date: Date;
  plannedTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  reason: string;
  notes: string;
  status: SessionStatus;
  autoSaved?: boolean;
  lastEditedAt?: Date;
  notificationSent?: boolean;
}

export interface SessionTimeline {
  status: SessionStatus;
  timestamp: Date;
  userId?: string;
}
