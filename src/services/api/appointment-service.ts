
import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

// Simulated data for appointments
const appointments: Appointment[] = [
  {
    id: 1,
    date: new Date().toISOString(),
    patientId: 1,
    reason: "Consultation initiale",
    status: "SCHEDULED",
    notificationSent: false
  }
];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointments();
      } catch (error) {
        console.error("Erreur Supabase getAppointments:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...appointments];
  },
  
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentsByPatientId:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return appointments.filter(appointment => appointment.patientId === patientId);
  },
  
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentById(id);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return appointments.find(appointment => appointment.id === id);
  },
  
  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.createAppointment(appointmentData);
      } catch (error) {
        console.error("Erreur Supabase createAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(400);
    const newAppointment = {
      ...appointmentData,
      id: appointments.length + 1
    } as Appointment;
    
    appointments.push(newAppointment);
    return newAppointment;
  },
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.updateAppointment(id, appointmentData);
      } catch (error) {
        console.error("Erreur Supabase updateAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointmentData };
      return appointments[index];
    }
    return undefined;
  },
  
  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        await supabaseAppointmentService.deleteAppointment(id);
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  }
};
