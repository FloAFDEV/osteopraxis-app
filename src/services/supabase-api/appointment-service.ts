import { Appointment, AppointmentStatus } from "@/types";
import { supabase, addAuthHeaders } from "./utils";

// Helper function to map between AppointmentStatus values and Supabase values
const mapStatusToSupabase = (status: AppointmentStatus): "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW" | "RESCHEDULED" => {
  // Map "CANCELLED" to "CANCELED" for Supabase compatibility
  if (status === "CANCELLED") return "CANCELED";
  return status as "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW" | "RESCHEDULED";
};

const mapStatusFromSupabase = (status: "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW" | "RESCHEDULED"): AppointmentStatus => {
  // Map "CANCELED" from Supabase to "CANCELLED" for app types
  if (status === "CANCELED") return "CANCELLED";
  return status as AppointmentStatus;
};

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .order('date', { ascending: false });
      
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

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return undefined;
      
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
        .order('date', { ascending: false });
      
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

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      // Map the status for Supabase compatibility
      const appointmentData = {
        ...appointment,
        status: mapStatusToSupabase(appointment.status)
      };
      
      const { data, error } = await supabase
        .from("Appointment")
        .insert(appointmentData)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        status: mapStatusFromSupabase(data.status)
      } as Appointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      // If status is included, map it for Supabase compatibility
      const appointmentData = { ...appointment };
      if (appointmentData.status) {
        appointmentData.status = mapStatusToSupabase(appointmentData.status);
      }
      
      const query = supabase
        .from("Appointment")
        .update(appointmentData)
        .eq("id", id)
        .select()
        .single();
      
      // Apply auth headers to fix CORS issues with PATCH
      const authedQuery = await addAuthHeaders(query);
      const { data, error } = await authedQuery;
      
      if (error) throw error;
      
      return {
        ...data,
        status: mapStatusFromSupabase(data.status)
      } as Appointment;
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
