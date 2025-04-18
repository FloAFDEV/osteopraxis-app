
import { Appointment, AppointmentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        console.log("API: Appel à supabaseAppointmentService.getAppointments");
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
        console.log(`API: Appel à supabaseAppointmentService.getAppointmentById(${id})`);
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
        console.log(`API: Appel à supabaseAppointmentService.getAppointmentsByPatientId(${patientId})`);
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
        console.log("API: Appel à supabaseAppointmentService.createAppointment", appointment);
        return await supabaseAppointmentService.createAppointment(appointment);
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
      notificationSent: false
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        console.log(`API: Appel à supabaseAppointmentService.updateAppointment(${id})`, appointment);
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

  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        console.log(`API: Appel à supabaseAppointmentService.deleteAppointment(${id})`);
        return await supabaseAppointmentService.deleteAppointment(id);
      } catch (error) {
        console.error("Erreur deleteAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: simuler la suppression locale
    await delay(300);
    return true;
  },
};
