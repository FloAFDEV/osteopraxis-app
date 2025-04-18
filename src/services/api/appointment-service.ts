import { Appointment } from "@/types";
import { delay, USE_SUPABASE, USE_FALLBACK } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

// Données simulées pour les rendez-vous
const simulatedAppointments: Appointment[] = [
  {
    id: 1,
    date: new Date().toISOString(),
    reason: "Douleur lombaire",
    status: "SCHEDULED",
    notificationSent: true,
    patientId: 1
  },
  {
    id: 2,
    date: new Date(Date.now() + 86400000).toISOString(), // demain
    reason: "Suivi général",
    status: "SCHEDULED",
    notificationSent: false,
    patientId: 2
  },
  {
    id: 3,
    date: new Date(Date.now() + 172800000).toISOString(), // après-demain
    reason: "Douleurs cervicales",
    status: "SCHEDULED",
    notificationSent: false,
    patientId: 3
  }
];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        const appointments = await supabaseAppointmentService.getAppointments();
        console.log("Retrieved appointments from Supabase:", appointments.length);
        return appointments;
      } catch (error) {
        console.error("Error in getAppointments from Supabase:", error);
        
        // Si le mode fallback est activé, utiliser les données simulées
        if (USE_FALLBACK) {
          console.log("Fallback: Returning simulated appointments data");
          await delay(300);
          return [...simulatedAppointments];
        }
        throw error;
      }
    }
    
    // Mode local: utiliser directement les données simulées
    console.log("Using local simulated appointment data");
    await delay(300);
    return [...simulatedAppointments];
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentById(id);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        if (USE_FALLBACK) {
          await delay(200);
          return simulatedAppointments.find(appointment => appointment.id === id);
        }
        throw error;
      }
    }
    await delay(200);
    return simulatedAppointments.find(appointment => appointment.id === id);
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'notificationSent'>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const createdAppointment = await supabaseAppointmentService.createAppointment(appointment);
        return createdAppointment;
      } catch (error) {
        console.error("Erreur Supabase createAppointment:", error);
        throw error;
      }
    }
    await delay(400);
    const newAppointment = {
      ...appointment,
      id: simulatedAppointments.length + 1,
      notificationSent: false
    } as Appointment;
    simulatedAppointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const updatedAppointment = await supabaseAppointmentService.updateAppointment(appointment);
        return updatedAppointment;
      } catch (error) {
        console.error("Erreur Supabase updateAppointment:", error);
        throw error;
      }
    }
    await delay(300);
    const index = simulatedAppointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      simulatedAppointments[index] = { ...simulatedAppointments[index], ...appointment };
      return simulatedAppointments[index];
    }
    throw new Error(`Appointment with id ${appointment.id} not found`);
  },

  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabaseAppointmentService.deleteAppointment(id);
        if (error) {
          throw error;
        }
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteAppointment:", error);
        throw error;
      }
    }
    await delay(300);
    const index = simulatedAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      simulatedAppointments.splice(index, 1);
      return true;
    }
    return false;
  }
};
