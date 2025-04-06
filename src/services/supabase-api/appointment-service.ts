
import { Appointment } from "@/types";
import { supabase, WithStatus } from "./utils";
import { adaptAppointmentStatusFromSupabase, adaptAppointmentStatusForSupabase } from "@/utils/patient-form-helpers";

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .order("date", { ascending: true });
      
    if (error) throw new Error(error.message);
    
    // Adapter les statuts pour l'application
    return (data as any[]).map(appointment => ({
      ...appointment,
      status: adaptAppointmentStatusFromSupabase(appointment.status)
    } as Appointment));
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") { // Code pour "pas de résultat"
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return {
      ...(data as any),
      status: adaptAppointmentStatusFromSupabase((data as any).status)
    } as Appointment;
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("patientId", patientId)
      .order("date", { ascending: true });
      
    if (error) throw new Error(error.message);
    
    return (data as any[]).map(appointment => ({
      ...appointment,
      status: adaptAppointmentStatusFromSupabase(appointment.status)
    } as Appointment));
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    // Adapter le format pour Supabase
    const adaptedStatus = adaptAppointmentStatusForSupabase(appointmentData.status);
    
    const { data, error } = await supabase
      .from("Appointment")
      .insert({
        ...appointmentData,
        status: adaptedStatus
      } as WithStatus<any>)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return {
      ...(data as any),
      status: adaptAppointmentStatusFromSupabase((data as any).status)
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    // Adapter les données pour Supabase
    const adaptedStatus = appointment.status ? adaptAppointmentStatusForSupabase(appointment.status) : undefined;
    
    const { data, error } = await supabase
      .from("Appointment")
      .update({
        ...appointment,
        status: adaptedStatus
      } as WithStatus<any>)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return {
      ...(data as any),
      status: adaptAppointmentStatusFromSupabase((data as any).status)
    } as Appointment;
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
