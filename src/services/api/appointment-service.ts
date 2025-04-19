import { Appointment, AppointmentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabase } from "@/integrations/supabase/client";

// Sample data for development
const appointments: Appointment[] = [];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Appointment')
          .select('*')
          .order('date', { ascending: true });
          
        if (error) throw error;
        return data as Appointment[];
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
        return data as Appointment;
      } catch (error) {
        console.error("Error fetching appointment by ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    return appointments.find(appointment => appointment.id === id) || null;
  },

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('Appointment')
          .insert({
            ...appointmentData,
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
          
        if (error) throw error;
        return data as Appointment;
      } catch (error) {
        console.error("Error creating appointment:", error);
        throw error;
      }
    }
    
    await delay(400);
    const now = new Date().toISOString();
    const newAppointment = {
      ...appointmentData,
      id: appointments.length + 1,
      status: 'PLANNED',
      createdAt: now,
      updatedAt: now,
    } as Appointment;
    appointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Appointment')
          .update({
            ...updates,
            updatedAt: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data as Appointment;
      } catch (error) {
        console.error("Error updating appointment:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Appointment with id ${id} not found`);
    
    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
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
          .eq('patientId', patientId)
          .order('date', { ascending: true });
          
        if (error) throw error;
        return data as Appointment[];
      } catch (error) {
        console.error("Error fetching appointments by patient ID:", error);
        throw error;
      }
    }
    
    // Mock implementation
    await delay(300);
    return []; // Return empty array for mock implementation
  },
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Appointment')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data as Appointment;
      } catch (error) {
        console.error("Error updating appointment status:", error);
        throw error;
      }
    }
    
    // Mock implementation
    await delay(200);
    return { id, status } as Appointment; // Return partial appointment for mock implementation
  },
};
