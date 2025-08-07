export interface AppointmentConflictInfo {
  hasConflict: boolean;
  conflictingAppointments?: AppointmentData[];
  message?: string;
  requestedDate?: string;
  currentDate?: string;
}

export interface ConflictInfo {
  conflictingAppointments: Array<{
    id: number;
    date: string;
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    reason: string;
    status: string;
  }>;
  requestedDate: string;
  currentDate: string;
}

export interface AppointmentFormData {
  patientId: number;
  date: string;
  time: string;
  duration: number;
  title: string;
  notes?: string;
  cabinetId?: number;
  osteopathId?: number;
}

export interface AppointmentUpdateData extends Partial<AppointmentFormData> {
  id?: number;
  force?: boolean;
  start?: string;
  end?: string;
  reason?: string;
  notificationSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentData {
  id: number;
  patientId: number;
  date: string;
  time?: string;
  start?: string;
  end?: string;
  duration?: number;
  title?: string;
  reason?: string;
  notes?: string;
  status: string;
  patientName?: string;
  cabinetId?: number;
  osteopathId?: number;
  createdAt?: string;
  updatedAt?: string;
  notificationSent?: boolean;
}