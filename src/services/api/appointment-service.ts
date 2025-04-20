
import { Appointment, AppointmentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { supabase } from "@/integrations/supabase/client";

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
    return [];
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
    return undefined;
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
    await delay(300);
    return [];
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Ensure date is a string
        const appointmentData = {
          ...appointment,
          date: typeof appointment.date === 'object' 
            ? (appointment.date as Date).toISOString() 
            : appointment.date
        };

        return await supabaseAppointmentService.createAppointment(appointmentData);
      } catch (error) {
        console.error("Erreur Supabase createAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(400);
    const now = new Date().toISOString();
    return {
      ...appointment,
      id: Math.floor(Math.random() * 1000),
      date: typeof appointment.date === 'object' 
        ? (appointment.date as Date).toISOString() 
        : appointment.date,
      notificationSent: false
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.updateAppointment(id, appointment);
      } catch (error) {
        console.error("Erreur Supabase updateAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return undefined;
  },

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        return await this.updateAppointment(id, { status });
      } catch (error) {
        console.error("Erreur Supabase updateAppointmentStatus:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return undefined;
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
    
    // Fallback: simuler la suppression locale
    await delay(300);
    return true;
  },
};
