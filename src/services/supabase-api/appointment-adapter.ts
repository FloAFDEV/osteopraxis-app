
import { Appointment } from "@/types";

export const adaptAppointmentFromSupabase = (data: any): Appointment => {
  // Log pour debugging les données reçues
  console.log('Données appointment brutes:', data);
  console.log('Patient associé:', data.Patient);
  console.log('Genre du patient:', data.Patient?.gender);
  
  return {
    id: data.id,
    date: data.date,
    time: data.time,
    duration: data.duration,
    reason: data.reason,
    status: data.status,
    notes: data.notes,
    patientId: data.patientId,
    patientName: data.Patient ? `${data.Patient.firstName} ${data.Patient.lastName}` : 'Patient inconnu',
    patientGender: data.Patient?.gender || null, // S'assurer que le genre est correctement mappé
    osteopathId: data.osteopathId,
    cabinetId: data.cabinetId,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
};
