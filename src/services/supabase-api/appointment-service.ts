
import { Appointment, AppointmentStatus } from "@/types";
import { supabase, supabaseAdmin, addAuthHeaders, ensureAppointmentStatus, AppointmentStatusValues, getCurrentOsteopathId } from "./utils";

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      
      // Si pas d'ostéopathe, utiliser le client admin
      if (!osteopathId) {
        console.log("Impossible de récupérer l'ID ostéopathe spécifique, utilisation de l'accès admin");
        const { data, error } = await supabaseAdmin
          .from('Appointment')
          .select('*')
          .order('date', { ascending: true });
        
        if (error) {
          console.error('Erreur lors de la récupération des rendez-vous:', error);
          return [];
        }
        
        console.log(`${data?.length || 0} rendez-vous trouvés avec l'accès admin`);
        return data || [];
      }

      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select('*')
          .order('date', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return data || [];
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
      
      return data || undefined;
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
      
      return data || [];
    } catch (error) {
      console.error("Erreur getAppointmentsByPatientId:", error);
      throw error;
    }
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      // Make sure the status value is one of the allowed enum values
      const validStatus = ensureAppointmentStatus(appointmentData.status);
      
      // Create appointment with proper status type
      const appointmentToCreate = {
        ...appointmentData,
        status: validStatus
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
      
      return data;
    } catch (error) {
      console.error("Erreur createAppointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      const updateData: Record<string, any> = { ...appointmentData };
      
      if ('status' in appointmentData && appointmentData.status) {
        // Make sure status is a valid enum value
        updateData.status = ensureAppointmentStatus(appointmentData.status);
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
      
      return data;
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
