
import { Appointment, DatabaseAppointmentStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { delay, USE_SUPABASE } from "./config";

// Mapping between app AppointmentStatus and database status
const mapAppointmentStatusToDb = (status: string): DatabaseAppointmentStatus => {
  switch (status) {
    case "PLANNED":
      return "SCHEDULED";
    case "CONFIRMED":
      return "SCHEDULED";
    case "CANCELLED":
      return "CANCELED";
    case "COMPLETED":
      return "COMPLETED";
    default:
      return "SCHEDULED";
  }
};

const mapDbStatusToAppStatus = (status: string): string => {
  switch (status) {
    case "SCHEDULED":
      return "PLANNED";
    case "CANCELED":
      return "CANCELLED";
    case "COMPLETED":
      return "COMPLETED";
    case "NO_SHOW":
      return "CANCELLED";
    case "RESCHEDULED":
      return "PLANNED";
    default:
      return "PLANNED";
  }
};

// Sample data for development
const appointments: Appointment[] = [];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Appointment')
          .select('*');

        if (error) throw error;
        
        // Convert DB status to app status
        const mappedData = data.map(appointment => ({
          ...appointment,
          status: mapDbStatusToAppStatus(appointment.status)
        }));
        
        return mappedData as Appointment[];
      } catch (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
    }

    await delay(300);
    return [...appointments];
  },

  async getAppointmentById(id: number): Promise<Appointment | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Appointment')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        // Convert DB status to app status
        if (data) {
          data.status = mapDbStatusToAppStatus(data.status);
        }
        
        return data as Appointment;
      } catch (error) {
        console.error("Error fetching appointment by ID:", error);
        throw error;
      }
    }

    await delay(200);
    return appointments.find(appointment => appointment.id === id) || null;
  },

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const dbStatus = mapAppointmentStatusToDb(appointment.status);
        
        // Only include fields that are in the Supabase schema
        const appointmentPayload = {
          date: appointment.date,
          patientId: appointment.patientId,
          reason: appointment.reason || '',
          cabinetId: appointment.cabinetId,
          status: dbStatus,
          notificationSent: appointment.notificationSent || false
        };
        
        const { data, error } = await supabase
          .from('Appointment')
          .insert(appointmentPayload)
          .select()
          .single();

        if (error) throw error;
        
        // Convert DB status to app status
        if (data) {
          data.status = mapDbStatusToAppStatus(data.status);
        }
        
        return data as Appointment;
      } catch (error) {
        console.error("Error creating appointment:", error);
        throw error;
      }
    }

    await delay(400);
    const now = new Date().toISOString();
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    appointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Map the status if present
        const dbStatus = updates.status ? mapAppointmentStatusToDb(updates.status) : undefined;
        
        // Only include fields that are in the Supabase schema
        const appointmentPayload = {
          date: updates.date,
          patientId: updates.patientId,
          reason: updates.reason,
          cabinetId: updates.cabinetId,
          status: dbStatus,
          notificationSent: updates.notificationSent
        };
        
        const { data, error } = await supabase
          .from('Appointment')
          .update(appointmentPayload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        // Convert DB status to app status
        if (data) {
          data.status = mapDbStatusToAppStatus(data.status);
        }
        
        return data as Appointment;
      } catch (error) {
        console.error("Error updating appointment:", error);
        throw error;
      }
    }

    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return appointments[index];
  },

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const dbStatus = mapAppointmentStatusToDb(status);
        
        const { data, error } = await supabase
          .from('Appointment')
          .update({ status: dbStatus })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        // Convert DB status to app status
        if (data) {
          data.status = mapDbStatusToAppStatus(data.status);
        }
        
        return data as Appointment;
      } catch (error) {
        console.error("Error updating appointment status:", error);
        throw error;
      }
    }

    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    appointments[index].status = status as any;
    appointments[index].updatedAt = new Date().toISOString();

    return appointments[index];
  },

  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase
          .from('Appointment')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error deleting appointment:", error);
        throw error;
      }
    }

    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Appointment')
          .select('*')
          .eq('patientId', patientId);

        if (error) throw error;
        
        // Convert DB status to app status
        const mappedData = data.map(appointment => ({
          ...appointment,
          status: mapDbStatusToAppStatus(appointment.status)
        }));
        
        return mappedData as Appointment[];
      } catch (error) {
        console.error("Error fetching appointments by patient ID:", error);
        throw error;
      }
    }

    await delay(300);
    return appointments.filter(a => a.patientId === patientId);
  }
};
