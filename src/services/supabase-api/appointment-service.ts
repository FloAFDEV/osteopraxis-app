
import { Appointment, AppointmentStatus } from "@/types";
import { supabase, addAuthHeaders } from "./utils";

// Type plus spécifique pour la création d'appointment
type CreateAppointmentPayload = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;
// Type pour les mises à jour d'appointment
type UpdateAppointmentPayload = Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>;

// Map entre les statuts de l'application et ceux de Supabase
const mapStatusToSupabase = (status: AppointmentStatus): "SCHEDULED" | "COMPLETED" | "CANCELED" | "RESCHEDULED" | "NO_SHOW" => {
  return status === "CANCELLED" ? "CANCELED" : status;
};

const mapStatusFromSupabase = (status: string): AppointmentStatus => {
  return status === "CANCELED" ? "CANCELLED" : status as AppointmentStatus;
};

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

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      const now = new Date().toISOString();
      
      // Création de l'objet à insérer avec les champs timestamp
      const insertable: Omit<Appointment, 'id'> = {
        ...payload,
        status: payload.status ?? "SCHEDULED",
        notificationSent: payload.notificationSent ?? false,
        createdAt: now,
        updatedAt: now
      };

      const { data, error } = await supabase
        .from("Appointment")
        .insert(insertable)
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.message);
        throw error;
      }
      
      return {
        ...data,
        status: mapStatusFromSupabase(data.status),
      };
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, update: UpdateAppointmentPayload): Promise<Appointment> {
    try {
      // Ne pas inclure createdAt ou updatedAt dans la mise à jour
      const now = new Date().toISOString();
      
      const updateData: UpdateAppointmentPayload & { updatedAt: string } = {
        ...update,
        updatedAt: now
      };

      // Si status est fourni, s'assurer qu'il est correctement mappé
      if (update.status) {
        updateData.status = mapStatusToSupabase(update.status);
      }

      const { data, error } = await supabase
        .from("Appointment")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.message);
        throw error;
      }

      return {
        ...data,
        status: mapStatusFromSupabase(data.status),
      };
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("Appointment")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.message);
        throw error;
      }
      return true;
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }
};
