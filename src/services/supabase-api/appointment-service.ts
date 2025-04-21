
import { Appointment, AppointmentStatus } from "@/types";
import { supabase, addAuthHeaders } from "./utils";

// Map between app and Supabase appointment statuses
const mapStatusToSupabase = (status: AppointmentStatus): "SCHEDULED" | "COMPLETED" | "CANCELED" | "RESCHEDULED" | "NO_SHOW" => {
  return status === "CANCELLED" ? "CANCELED" : status;
};

const mapStatusFromSupabase = (status: string): AppointmentStatus => {
  return status === "CANCELED" ? "CANCELLED" : status as AppointmentStatus;
};

// Type for appointment creation that omits generated fields
type CreateAppointmentInput = Omit<Appointment, 'id' | 'notificationSent' | 'createdAt' | 'updatedAt'>;

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(appointment => ({
        ...appointment,
        status: mapStatusFromSupabase(appointment.status)
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error(`Appointment with id ${id} not found`);
      
      return {
        ...data,
        status: mapStatusFromSupabase(data.status)
      };
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw error;
    }
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("patientId", patientId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(appointment => ({
        ...appointment,
        status: mapStatusFromSupabase(appointment.status)
      }));
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      throw error;
    }
  },

  async createAppointment(appointment: CreateAppointmentInput): Promise<Appointment> {
    try {
      // Exclude id from payload to let Postgres sequence handle it
      const payload = {
        ...appointment,
        status: appointment.status ? mapStatusToSupabase(appointment.status) : "SCHEDULED",
        // Don't include ID or timestamps - let Postgres handle them
        notificationSent: appointment.notificationSent ?? false
      };
      
      const { data, error } = await supabase
        .from("Appointment")
        .insert(payload)
        .select()
        .single();
      
      if (error) {
        console.error("Error details:", error.message);
        throw error;
      }
      
      return {
        ...data,
        status: mapStatusFromSupabase(data.status)
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      // Don't include timestamps in updates - let Postgres handle them with triggers
      const { createdAt, updatedAt, ...updatePayload } = appointment;
      
      const payload = {
        ...updatePayload,
        status: updatePayload.status ? mapStatusToSupabase(updatePayload.status) : undefined
      };
      
      const query = supabase
        .from("Appointment")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      
      // Apply auth headers to fix CORS issues with PATCH
      const authedQuery = await addAuthHeaders(query);
      const { data, error } = await authedQuery;
      
      if (error) {
        console.error("Error details:", error.message);
        throw error;
      }
      
      return {
        ...data,
        status: mapStatusFromSupabase(data.status)
      };
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },
  
  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const query = supabase
        .from("Appointment")
        .delete()
        .eq("id", id);
      
      // Apply auth headers to fix CORS issues with DELETE
      const authedQuery = await addAuthHeaders(query);
      const { error } = await authedQuery;
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }
};
