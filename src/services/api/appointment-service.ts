
import { Appointment, AppointmentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

// Type for appointment creation that omits generated fields
type CreateAppointmentInput = Omit<Appointment, 'id' | 'notificationSent' | 'createdAt' | 'updatedAt'>;

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
        const payload = {
          ...appointment,
          date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date
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
      date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date,
      notificationSent: false,
      status: appointment.status || "SCHEDULED",
      createdAt: now,
      updatedAt: now
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const payload = {
          ...appointment,
          date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date
        };
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
      updatedAt: now
    } as Appointment;
  },

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status });
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
