
import { Appointment } from "@/types";

export const adaptAppointmentFromSupabase = (data: any): Appointment => {
  // Log pour debugging les données reçues
  console.log('Données appointment brutes:', data);
  console.log('Patient associé:', data.Patient);
  console.log('Genre du patient:', data.Patient?.gender);
  
  return {
    id: data.id,
    date: data.date,
    start: data.date, // Utiliser date comme start
    end: data.date ? new Date(new Date(data.date).getTime() + (data.duration || 30) * 60000).toISOString() : data.date,
    reason: data.reason,
    status: data.status,
    notes: data.notes,
    patientId: data.patientId,
    patientName: data.Patient ? `${data.Patient.firstName} ${data.Patient.lastName}` : 'Patient inconnu',
    patientGender: data.Patient?.gender || null,
    osteopathId: data.osteopathId,
    cabinetId: data.cabinetId,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    notificationSent: data.notificationSent || false,
  };
};

// Interface pour les données de création d'appointment
export interface CreateAppointmentPayload {
  date: string;
  reason: string;
  status?: string;
  notes?: string;
  patientId: number;
  osteopathId: number;
  cabinetId?: number;
}

export const createAppointmentPayload = (appointmentData: any): CreateAppointmentPayload => {
  return {
    date: appointmentData.date,
    reason: appointmentData.reason,
    status: appointmentData.status || 'SCHEDULED',
    notes: appointmentData.notes,
    patientId: appointmentData.patientId,
    osteopathId: appointmentData.osteopathId,
    cabinetId: appointmentData.cabinetId,
  };
};
