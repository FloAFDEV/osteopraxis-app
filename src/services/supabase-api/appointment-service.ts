
import { Appointment, AppointmentStatus } from "@/types";
import { supabase } from "./utils";

// Type plus spécifique pour la création d'appointment
type CreateAppointmentPayload = {
  date: string;
  patientId: number;
  reason: string;
  status?: AppointmentStatus;
  cabinetId?: number;
  notificationSent?: boolean;
};

// Type pour l'objet réellement envoyé à Supabase
type InsertableAppointment = {
  date: string;
  patientId: number;
  reason: string;
  status: AppointmentStatus;
  cabinetId?: number;
  notificationSent: boolean;
};

// Type pour les mises à jour d'appointment
type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

// Fonction pour normaliser les status (si jamais "CANCELLED" est reçu d'anciennes données)
function normalizeStatus(status?: string): AppointmentStatus {
  if (status?.toUpperCase() === 'CANCELLED') return "CANCELED";
  return (status as AppointmentStatus) ?? "SCHEDULED";
}

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
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

      return data;
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

      return data || [];
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      throw error;
    }
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      // Création de l'objet à insérer - sans les champs timestamp qui sont auto-générés par la DB
      const insertable: InsertableAppointment = {
        date: payload.date,
        patientId: payload.patientId,
        reason: payload.reason,
        cabinetId: payload.cabinetId,
        status: normalizeStatus(payload.status),
        notificationSent: payload.notificationSent ?? false,
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
      
      return data;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, update: UpdateAppointmentPayload): Promise<Appointment> {
    try {
      const updateData: Partial<InsertableAppointment> = {
        ...update,
      };

      // Si status est fourni, s'assurer qu'il est correctement normalisé
      if (update.status) {
        updateData.status = normalizeStatus(update.status);
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

      return data;
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
