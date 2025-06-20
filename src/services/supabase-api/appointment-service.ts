import { Appointment, AppointmentFormData } from "@/types";
import { supabase } from "./utils";
import { adaptAppointmentFromSupabase } from "./appointment-adapter";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      
      if (!osteopathId) {
        console.warn("Aucun ostéopathe connecté pour récupérer les rendez-vous");
        return [];
      }

      const { data, error } = await supabase
        .from("Appointment")
        .select(`
          *,
          Patient!inner (
            id,
            firstName,
            lastName,
            gender
          )
        `)
        .eq("osteopathId", osteopathId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) {
        console.error("Erreur lors de la récupération des rendez-vous:", error);
        throw error;
      }

      if (!data) {
        return [];
      }

      console.log('Appointments récupérés avec patients:', data);
      
      return data.map(adaptAppointmentFromSupabase);
    } catch (error) {
      console.error("Erreur dans getAppointments:", error);
      throw error;
    }
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      
      if (!osteopathId) {
        throw new Error("Aucun ostéopathe connecté");
      }

      const { data, error } = await supabase
        .from("Appointment")
        .select(`
          *,
          Patient!inner (
            id,
            firstName,
            lastName,
            gender
          )
        `)
        .eq("patientId", patientId)
        .eq("osteopathId", osteopathId)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        console.error("Erreur lors de la récupération des rendez-vous par patient:", error);
        throw error;
      }

      if (!data) {
        return [];
      }

      return data.map(adaptAppointmentFromSupabase);
    } catch (error) {
      console.error("Erreur dans getAppointmentsByPatientId:", error);
      throw error;
    }
  },

  async createAppointment(appointment: AppointmentFormData): Promise<Appointment> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        throw new Error("Aucun ostéopathe connecté");
      }

      const { data, error } = await supabase
        .from("Appointment")
        .insert([{ ...appointment, osteopathId }])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du rendez-vous:", error);
        throw error;
      }

      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error("Erreur dans createAppointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour du rendez-vous:", error);
        throw error;
      }

      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error("Erreur dans updateAppointment:", error);
      throw error;
    }
  },

  async cancelAppointment(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("Appointment")
        .update({ status: 'CANCELED' })
        .eq("id", id);

      if (error) {
        console.error("Erreur lors de l'annulation du rendez-vous:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erreur dans cancelAppointment:", error);
      throw error;
    }
  },

  async deleteAppointment(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("Appointment")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erreur lors de la suppression du rendez-vous:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erreur dans deleteAppointment:", error);
      throw error;
    }
  },
};

export default appointmentService;
