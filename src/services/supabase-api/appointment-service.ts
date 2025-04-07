
import { Appointment } from "@/types";
import { supabase } from "./utils";
import { adaptAppointmentStatusFromSupabase, adaptAppointmentStatusForSupabase } from "@/utils/patient-form-helpers";

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .order("date", { ascending: true });
      
    if (error) throw new Error(error.message);
    
    // Using type assertion to handle the data correctly
    return (data || []).map(appointment => {
      // Type guard to ensure we're dealing with appointment objects
      if (!('status' in appointment)) {
        console.error("Invalid appointment data:", appointment);
        return null;
      }
      
      return {
        id: appointment.id,
        date: appointment.date,
        reason: appointment.reason,
        patientId: appointment.patientId,
        status: adaptAppointmentStatusFromSupabase(appointment.status),
        notificationSent: appointment.notificationSent
      } as Appointment;
    }).filter(Boolean) as Appointment[]; // Remove any null values
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .maybeSingle();
      
    if (error) {
      if (error.code === "PGRST116") { // Code pour "pas de résultat"
        return undefined;
      }
      throw new Error(error.message);
    }
    
    if (!data) return undefined;
    
    // Type guard to ensure we're dealing with appointment data
    if (!('status' in data)) {
      console.error("Invalid appointment data:", data);
      return undefined;
    }
    
    // Use explicit type conversion for the returned object
    return {
      id: data.id,
      date: data.date,
      reason: data.reason,
      patientId: data.patientId,
      status: adaptAppointmentStatusFromSupabase(data.status),
      notificationSent: data.notificationSent
    } as Appointment;
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .order("date", { ascending: true });
      
    if (error) throw new Error(error.message);
    
    // Using type assertion to safely handle data
    return (data || []).map(appointment => {
      if (!('status' in appointment)) {
        console.error("Invalid appointment data:", appointment);
        return null;
      }
      
      return {
        id: appointment.id,
        date: appointment.date,
        reason: appointment.reason,
        patientId: appointment.patientId,
        status: adaptAppointmentStatusFromSupabase(appointment.status),
        notificationSent: appointment.notificationSent
      } as Appointment;
    }).filter(Boolean) as Appointment[];
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    // Adapt the status for Supabase
    const adaptedStatus = adaptAppointmentStatusForSupabase(appointmentData.status);
    
    const { data, error } = await supabase
      .from("Appointment")
      .insert({
        date: appointmentData.date,
        reason: appointmentData.reason,
        patientId: appointmentData.patientId,
        status: adaptedStatus,
        notificationSent: appointmentData.notificationSent ?? false
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      date: data.date,
      reason: data.reason,
      patientId: data.patientId,
      status: adaptAppointmentStatusFromSupabase(data.status),
      notificationSent: data.notificationSent
    } as Appointment;
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
      
      // Use the update method instead of POST
      const { data, error } = await supabase
        .from("Appointment")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
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
    const { error } = await supabase
      .from("Appointment")
      .delete()
      .eq("id", id);
    
    if (error) throw new Error(error.message);
    
    return true;
  }
};
