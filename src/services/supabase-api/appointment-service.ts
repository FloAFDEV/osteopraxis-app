
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
      // Omettre id et timestamps, laisser Postgres les remplir (s'ils ont des DEFAULTs)
      const {
        id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, notificationSent, ...insertable
      } = appointment as any;
      const { data, error } = await supabase
        .from("Appointment")
        .insert({
          ...insertable,
          status: appointment.status ?? "SCHEDULED",
          // notificationSent (facultatif) : si non défini, colonne sql a-t-elle un DEFAULT ?
          notificationSent: notificationSent ?? false,
        })
        .single();

      if (error) {
        // Log dynamique
        console.error("[SUPABASE ERROR]", error.code, error.constraint, error.message);
        throw error;
      }

      return {
        ...data,
        status: mapStatusFromSupabase(data.status)
      };
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      // N'envoyer createdAt ni updatedAt, on laisse Postgres gérer les triggers/defaults updatedAt
      const patch = { ...appointment } as Partial<Appointment>;
      delete (patch as any).createdAt;
      delete (patch as any).updatedAt;

      // Forcer la màj du champ updatedAt côté SQL si besoin (à adapter si trigger)
      patch.updatedAt = new Date().toISOString();

      const query = supabase
        .from("Appointment")
        .update(patch)
        .eq("id", id)
        .single();

      // Application d'en-têtes d'auth si nécessaire
      const authedQuery = await addAuthHeaders(query);
      const { data, error } = await authedQuery;

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.constraint, error.message);
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

      // Application d'en-têtes d'auth si besoin
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
