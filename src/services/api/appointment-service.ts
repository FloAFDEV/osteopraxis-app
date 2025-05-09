import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { AppointmentStatus } from "@/types"; 

// Create a custom error class for appointment conflicts
export class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentConflictError";
  }
}

// Mock data (replace with actual data fetching)
const appointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    date: new Date().toISOString(),
    reason: "Consultation de routine",
    status: "SCHEDULED",
    notificationSent: false,
  },
  {
    id: 2,
    patientId: 2,
    date: new Date().toISOString(),
    reason: "Suivi post-opératoire",
    status: "COMPLETED",
    notificationSent: false,
  },
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

    await delay(300);
    return [...appointments];
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

    await delay(200);
    return appointments.find((appointment) => appointment.id === id);
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

    await delay(200);
    return appointments.filter((appointment) => appointment.patientId === patientId);
  },
  
  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getTodayAppointmentForPatient(patientId);
      } catch (error) {
        console.error("Erreur Supabase getTodayAppointmentForPatient:", error);
        throw error;
      }
    }
    
    // Mock implementation for non-Supabase mode
    await delay(200);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return appointments.find(a => 
      a.patientId === patientId && 
      new Date(a.date) >= today && 
      new Date(a.date) < tomorrow
    ) || null;
  },

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.createAppointment(appointment);
      } catch (error) {
        console.error("Erreur lors de la création de la séance:", error);
        throw error;
      }
    }
    
    await delay(500);
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1,
    };
    appointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.updateAppointment(id, update);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la séance:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...update };
      return appointments[index];
    }
    throw new Error(`Séance avec l'identifiant ${id} non trouvée`);
  },
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status });
  },
  
  async cancelAppointment(id: number): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.cancelAppointment(id);
      } catch (error) {
        console.error("Erreur lors de l'annulation de la séance:", error);
        throw error;
      }
    }
    
    return this.updateAppointment(id, { status: "CANCELED" });
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

    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  },
};
