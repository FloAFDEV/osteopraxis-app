
import { Appointment, AppointmentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

// Type guard pour vérifier si une valeur est une Date
function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// Function to normalize status
function normalizeStatus(status?: string): AppointmentStatus {
  if (status?.toUpperCase() === 'CANCELLED') return "CANCELED";
  return (status as AppointmentStatus) ?? "SCHEDULED";
}

// Type pour la création d'un rendez-vous sans les champs générés
type CreateAppointmentInput = Omit<Appointment, 'id' | 'notificationSent' | 'createdAt' | 'updatedAt'> & {
  notificationSent?: boolean;
};

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
    
    // Mock: return empty array instead of undefined
    await delay(300);
    return [];
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentById(id);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        throw error;
      }
    }
    
    // Mock: return a minimal mock appointment instead of undefined
    await delay(200);
    return {
      id,
      date: new Date().toISOString(),
      patientId: 1,
      status: "SCHEDULED",
      reason: "Mock appointment",
      notificationSent: false
    } as Appointment;
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
    
    await delay(300);
    return [];
  },

  async createAppointment(appointment: CreateAppointmentInput): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Convertir la date si nécessaire et normaliser le status
        const payload = {
          ...appointment,
          notificationSent: appointment.notificationSent ?? false,
          status: normalizeStatus(appointment.status),
          date: isDate(appointment.date) ? appointment.date.toISOString() : appointment.date
        };
        return await supabaseAppointmentService.createAppointment(payload);
      } catch (error) {
        console.error("Erreur Supabase createAppointment:", error);
        throw error;
      }
    }
    
    // Mock: return a complete mock appointment
    await delay(400);
    const now = new Date().toISOString();
    return {
      ...appointment,
      id: Math.floor(Math.random() * 1000),
      date: isDate(appointment.date) ? appointment.date.toISOString() : appointment.date,
      notificationSent: appointment.notificationSent ?? false,
      status: normalizeStatus(appointment.status),
      createdAt: now,
      updatedAt: now
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Convertir la date si nécessaire et normaliser le status
        const payload: Partial<Appointment> = { ...appointment };
        
        if (appointment.date) {
          payload.date = isDate(appointment.date) ? appointment.date.toISOString() : appointment.date;
        }
        
        if (appointment.status) {
          payload.status = normalizeStatus(appointment.status);
        }
          
        return await supabaseAppointmentService.updateAppointment(id, payload);
      } catch (error) {
        console.error("Erreur Supabase updateAppointment:", error);
        throw error;
      }
    }
    
    // Mock: return updated appointment data
    await delay(300);
    const now = new Date().toISOString();
    return {
      ...appointment,
      id,
      date: isDate(appointment.date) ? appointment.date.toISOString() : appointment.date,
      status: appointment.status ? normalizeStatus(appointment.status) : undefined,
      updatedAt: now
    } as Appointment;
  },

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status: normalizeStatus(status) });
  },
  
  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.deleteAppointment(id);
      } catch (error) {
        console.error("Erreur Supabase deleteAppointment:", error);
        throw error;
      }
    }
    
    await delay(300);
    return true;
  }
};
