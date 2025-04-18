
import { Appointment, AppointmentStatus } from "@/types";
import { supabase, addAuthHeaders, ensureAppointmentStatus, AppointmentStatusValues } from "./utils";

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .order('date', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      // Transform data with proper typing
      return data.map(item => ({
        id: item.id,
        date: item.date,
        reason: item.reason,
        patientId: item.patientId,
        status: item.status as AppointmentStatus,
        notificationSent: item.notificationSent
      }));
    } catch (error) {
      console.error("Erreur getAppointments:", error);
      throw error;
    }
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .eq("id", id)
          .maybeSingle()
      );
      
      const { data, error } = await query;
      
      if (error) {
        if (error.code === "PGRST116") {
          return undefined;
        }
        throw new Error(error.message);
      }
      
      if (!data) return undefined;
      
      // Transform data with proper typing
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: data.status as AppointmentStatus,
        notificationSent: data.notificationSent
      };
    } catch (error) {
      console.error("Erreur getAppointmentById:", error);
      throw error;
    }
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .eq("patientId", patientId)
          .order('date', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      // Transform data with proper typing
      return data.map(item => ({
        id: item.id,
        date: item.date,
        reason: item.reason,
        patientId: item.patientId,
        status: item.status as AppointmentStatus,
        notificationSent: item.notificationSent
      }));
    } catch (error) {
      console.error("Erreur getAppointmentsByPatientId:", error);
      throw error;
    }
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      // Make sure the status value is one of the allowed enum values
      const validStatus = ensureAppointmentStatus(appointmentData.status);
      
      // Create appointment with proper status type
      const appointmentToCreate = {
        date: appointmentData.date,
        reason: appointmentData.reason,
        patientId: appointmentData.patientId,
        status: validStatus as AppointmentStatus,
        notificationSent: appointmentData.notificationSent
      };
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .insert(appointmentToCreate)
          .select()
          .single()
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: data.status as AppointmentStatus,
        notificationSent: data.notificationSent
      };
    } catch (error) {
      console.error("Erreur createAppointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      const updateData: Record<string, any> = {};
      
      if ('date' in appointmentData) updateData.date = appointmentData.date;
      if ('reason' in appointmentData) updateData.reason = appointmentData.reason;
      if ('patientId' in appointmentData) updateData.patientId = appointmentData.patientId;
      if ('status' in appointmentData && appointmentData.status) {
        // Make sure status is a valid enum value
        updateData.status = ensureAppointmentStatus(appointmentData.status);
      }
      if ('notificationSent' in appointmentData) updateData.notificationSent = appointmentData.notificationSent;
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: data.status as AppointmentStatus,
        notificationSent: data.notificationSent
      };
    } catch (error) {
      console.error("Erreur updateAppointment:", error);
      throw error;
    }
  },
  
  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .delete()
          .eq("id", id)
      );
      
      const { error } = await query;
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      console.error("Erreur deleteAppointment:", error);
      throw error;
    }
  }
};
