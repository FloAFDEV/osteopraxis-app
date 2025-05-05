import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

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

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.createAppointment(appointment);
      } catch (error) {
        console.error("Error creating appointment:", error);
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
        console.error("Error updating appointment:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...update };
      return appointments[index];
    }
    throw new Error(`Appointment with id ${id} not found`);
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
