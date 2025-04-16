import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

// Données simulées pour les rendez-vous
const appointments: Appointment[] = [
  {
    id: 1,
    date: "2025-01-23 09:00:00",
    reason: "Consultation générale",
    patientId: 1,
    status: "SCHEDULED",
    notificationSent: false
  },
  // Les autres rendez-vous fictifs sont maintenus mais omis pour plus de lisibilité
];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        console.log("Tentative de récupération des rendez-vous depuis Supabase...");
        const result = await supabaseAppointmentService.getAppointments();
        // Log pour debugging
        console.log(`Récupération de ${result?.length || 0} rendez-vous`);
        return result;
      } catch (error) {
        console.error("Erreur Supabase getAppointments:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...appointments];
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        console.log(`Recherche du rendez-vous avec l'ID: ${id}`);
        const result = await supabaseAppointmentService.getAppointmentById(id);
        console.log(`Résultat de la recherche:`, result);
        return result;
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return appointments.find(appointment => appointment.id === id);
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

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.createAppointment(appointment);
      } catch (error) {
        console.error("Erreur Supabase createAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(400);
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1,
    };
    appointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        console.log("Updating appointment with ID:", id, "Data:", appointment);
        const result = await supabaseAppointmentService.updateAppointment(id, appointment);
        console.log("Update result:", result);
        return result;
      } catch (error) {
        console.error("Erreur Supabase updateAppointment:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointment };
      return appointments[index];
    }
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
