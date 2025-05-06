import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { AppointmentStatus } from "@/types"; // Add this import

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
  
  async rescheduleAppointment(id: number, newDate: string): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // First update the status to rescheduled
        const updatedAppointment = await supabaseAppointmentService.updateAppointment(id, { 
          status: "RESCHEDULED", 
          date: newDate 
        });
        return updatedAppointment;
      } catch (error) {
        console.error("Erreur lors du report de la séance:", error);
        throw error;
      }
    }
    
    // For non-Supabase implementation
    return this.updateAppointment(id, { 
      status: "RESCHEDULED",
      date: newDate
    });
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
  
  async getUpcomingAppointments(): Promise<Appointment[]> {
    // Implementation for upcoming appointments
    const allAppointments = await this.getAppointments();
    const now = new Date();
    return allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate > now && appointment.status === "SCHEDULED";
    });
  },
  
  async getAppointmentsByOsteopathId(osteopathId: number): Promise<Appointment[]> {
    // For now, just return all appointments (we'd need to link appointments to osteopaths properly)
    if (USE_SUPABASE) {
      try {
        // Assuming the supabaseAppointmentService has this method
        // If it doesn't, you'd need to implement it
        return await supabaseAppointmentService.getAppointments();
      } catch (error) {
        console.error("Erreur lors de la récupération des séances par ostéopathe:", error);
        throw error;
      }
    }
    
    return this.getAppointments();
  },
  
  async getAppointmentCount(): Promise<number> {
    const appointments = await this.getAppointments();
    return appointments.length;
  }
};

// Export individual functions for the API module
export const getAppointments = async (): Promise<Appointment[]> => {
  return appointmentService.getAppointments();
};

export const getAppointmentById = async (id: number): Promise<Appointment | undefined> => {
  return appointmentService.getAppointmentById(id);
};

export const createAppointment = async (appointment: Omit<Appointment, "id">): Promise<Appointment> => {
  return appointmentService.createAppointment(appointment);
};

export const updateAppointment = async (id: number, update: Partial<Appointment>): Promise<Appointment> => {
  return appointmentService.updateAppointment(id, update);
};

export const deleteAppointment = async (id: number): Promise<boolean> => {
  return appointmentService.deleteAppointment(id);
};

export const getAppointmentsByPatientId = async (patientId: number): Promise<Appointment[]> => {
  return appointmentService.getAppointmentsByPatientId(patientId);
};

export const updateAppointmentStatus = async (id: number, status: AppointmentStatus): Promise<Appointment> => {
  return appointmentService.updateAppointmentStatus(id, status);
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  return appointmentService.cancelAppointment(id);
};

export const rescheduleAppointment = async (id: number, newDate: string): Promise<Appointment> => {
  return appointmentService.rescheduleAppointment(id, newDate);
};

export const getUpcomingAppointments = async (): Promise<Appointment[]> => {
  return appointmentService.getUpcomingAppointments();
};

export const getAppointmentsByOsteopathId = async (osteopathId: number): Promise<Appointment[]> => {
  return appointmentService.getAppointmentsByOsteopathId(osteopathId);
};

export const getAppointmentCount = async (): Promise<number> => {
  return appointmentService.getAppointmentCount();
};
