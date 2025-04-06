
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
      .maybeSingle();
      
    if (error) {
      if (error.code === "PGRST116") { // Code pour "pas de résultat"
        return undefined;
      }
      throw new Error(error.message);
    }
    
    if (!data) return undefined;
    
    // Utiliser une conversion de type explicite pour éviter la récursion infinie
    return {
      id: data.id,
      date: data.date,
      reason: data.reason,
      patientId: data.patientId,
      status: adaptAppointmentStatusFromSupabase(data.status),
      notificationSent: data.notificationSent
    };
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
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    // Utiliser une conversion de type explicite pour éviter la récursion infinie
    return {
      id: data.id,
      date: data.date,
      reason: data.reason,
      patientId: data.patientId,
      status: adaptAppointmentStatusFromSupabase(data.status),
      notificationSent: data.notificationSent
    };
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      // Adapter les données pour Supabase
      const updateData: any = {...appointment};
      
      if (appointment.status) {
        updateData.status = adaptAppointmentStatusForSupabase(appointment.status);
      }
      
      // Utiliser le bon verb HTTP pour la mise à jour
      const { data, error } = await supabase
        .from("Appointment")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Utiliser une conversion de type explicite pour éviter la récursion infinie
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: adaptAppointmentStatusFromSupabase(data.status),
        notificationSent: data.notificationSent
      };
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
