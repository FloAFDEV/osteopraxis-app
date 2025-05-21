
import { SupabaseClient } from '@supabase/supabase-js';

// Types de base pour les entités
export interface PatientRow {
  id: number;
  firstName?: string;
  lastName?: string;
  osteopathId?: number;
}

export interface AppointmentRow {
  id: number;
  patientId: number;
  osteopathId?: number;
}

export interface InvoiceRow {
  id: number;
  patientId: number;
  osteopathId?: number;
  appointmentId?: number | null;
}

export interface CabinetRow {
  id: number;
  name: string;
  osteopathId: number;
}
