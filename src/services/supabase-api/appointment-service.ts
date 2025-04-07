
import { Appointment, AppointmentStatus } from "@/types";
import { supabase, addAuthHeaders } from "./utils";
import { adaptAppointmentStatusFromSupabase, adaptAppointmentStatusForSupabase } from "@/utils/patient-form-helpers";

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .order("date", { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Type safety - assert that data is array of appointment records
      const appointments = data || [];
      
      return appointments.map(appointment => ({
        id: appointment.id,
        date: appointment.date,
        reason: appointment.reason,
        patientId: appointment.patientId,
        status: adaptAppointmentStatusFromSupabase(appointment.status),
        notificationSent: appointment.notificationSent
      } as Appointment));
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
        if (error.code === "PGRST116") { // Code pour "pas de résultat"
          return undefined;
        }
        throw new Error(error.message);
      }
      
      if (!data) return undefined;
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: adaptAppointmentStatusFromSupabase(data.status),
        notificationSent: data.notificationSent
      } as Appointment;
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
          .order("date", { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      const appointments = data || [];
      
      return appointments.map(appointment => ({
        id: appointment.id,
        date: appointment.date,
        reason: appointment.reason,
        patientId: appointment.patientId,
        status: adaptAppointmentStatusFromSupabase(appointment.status),
        notificationSent: appointment.notificationSent
      } as Appointment));
    } catch (error) {
      console.error("Erreur getAppointmentsByPatientId:", error);
      throw error;
    }
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      // Adapt the status for Supabase
      const adaptedStatus = adaptAppointmentStatusForSupabase(appointmentData.status);
      
      // Créer un objet d'insertion correctement typé pour Supabase
      const insertData = {
        date: appointmentData.date,
        reason: appointmentData.reason,
        patientId: appointmentData.patientId,
        status: adaptedStatus,
        notificationSent: appointmentData.notificationSent ?? false
      };
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .insert(insertData)
          .select()
          .single()
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      if (!data) {
        throw new Error("Aucune donnée retournée lors de la création du rendez-vous");
      }
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: adaptAppointmentStatusFromSupabase(data.status),
        notificationSent: data.notificationSent
      } as Appointment;
    } catch (error) {
      console.error("Erreur createAppointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      // Create a properly typed update object
      const updateData: Record<string, any> = {};
      
      if (appointment.date !== undefined) updateData.date = appointment.date;
      if (appointment.reason !== undefined) updateData.reason = appointment.reason;
      if (appointment.patientId !== undefined) updateData.patientId = appointment.patientId;
      if (appointment.notificationSent !== undefined) updateData.notificationSent = appointment.notificationSent;
      if (appointment.status !== undefined) {
        updateData.status = adaptAppointmentStatusForSupabase(appointment.status);
      }
      
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
      
      if (!data) {
        return undefined;
      }
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: adaptAppointmentStatusFromSupabase(data.status),
        notificationSent: data.notificationSent
      } as Appointment;
    } catch (error) {
      console.error("Erreur Supabase updateAppointment:", error);
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
