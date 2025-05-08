
import { Appointment, AppointmentStatus } from "@/types";
import { supabase } from "./utils";
import { adaptAppointmentFromSupabase, adaptAppointmentToSupabase } from "./appointment-adapter";
import { corsHeaders } from "@/services/corsHeaders";

// Interface simplifiée pour les requêtes Supabase
type AppointmentInsert = {
  patientId: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  osteopathId: number;
  notificationSent?: boolean;
  notes?: string;
  cabinetId?: number;
};

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return [];
      }

      // Now get appointments for this osteopath only
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("osteopathId", userData.osteopathId)
        .order("date", { ascending: true });

      if (error) throw error;
      
      // Convert data to proper appointment types
      return (data || []).map((item: any) => adaptAppointmentFromSupabase(item));
    } catch (error) {
      console.error("Error in getAppointments:", error);
      throw error;
    }
  },

  async getAppointmentById(id: number): Promise<Appointment | null> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return null;
      }

      // Now get the appointment, ensuring it belongs to the user's osteopath
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("id", id)
        .eq("osteopathId", userData.osteopathId)
        .single();

      if (error) {
        console.error("Error fetching appointment:", error);
        return null;
      }

      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error("Error in getAppointmentById:", error);
      return null;
    }
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return [];
      }

      // Now get appointments for this patient and osteopath
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("patientId", patientId)
        .eq("osteopathId", userData.osteopathId)
        .order("date", { ascending: true });

      if (error) throw error;
      
      return (data || []).map((item: any) => adaptAppointmentFromSupabase(item));
    } catch (error) {
      console.error("Error in getAppointmentsByPatientId:", error);
      throw error;
    }
  },
  
  async createAppointment(appointmentData: Omit<Appointment, "id">): Promise<Appointment> {
    try {
      // First make sure we have the current user's osteopathId
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        throw new Error("Unable to get osteopath ID");
      }

      // Create the insert object directly with proper typing
      const insertData: AppointmentInsert = {
        patientId: appointmentData.patientId,
        date: appointmentData.date,
        reason: appointmentData.reason || "",
        status: appointmentData.status,
        osteopathId: userData.osteopathId,
        notificationSent: appointmentData.notificationSent || false,
        notes: appointmentData.notes || "",
        cabinetId: appointmentData.cabinetId || null,
      };

      const { data, error } = await supabase
        .from("Appointment")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return null;
      }

      // Create an update object with explicit typing
      const updateData: Partial<AppointmentInsert> = {};
      
      if (appointmentData.patientId !== undefined) updateData.patientId = appointmentData.patientId;
      if (appointmentData.date !== undefined) updateData.date = appointmentData.date;
      if (appointmentData.reason !== undefined) updateData.reason = appointmentData.reason;
      if (appointmentData.status !== undefined) updateData.status = appointmentData.status;
      if (appointmentData.notificationSent !== undefined) updateData.notificationSent = appointmentData.notificationSent;
      if (appointmentData.notes !== undefined) updateData.notes = appointmentData.notes;
      if (appointmentData.cabinetId !== undefined) updateData.cabinetId = appointmentData.cabinetId;

      // Now update the appointment, ensuring it belongs to the user's osteopath
      const { data, error } = await supabase
        .from("Appointment")
        .update(updateData)
        .eq("id", id)
        .eq("osteopathId", userData.osteopathId)
        .select()
        .single();

      if (error) {
        console.error("Error updating appointment:", error);
        return null;
      }
      
      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

  async cancelAppointment(id: number): Promise<Appointment | null> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return null;
      }

      // Now update the appointment status to "CANCELED", ensuring it belongs to the user's osteopath
      const { data, error } = await supabase
        .from("Appointment")
        .update({ status: "CANCELED" })
        .eq("id", id)
        .eq("osteopathId", userData.osteopathId)
        .select()
        .single();

      if (error) {
        console.error("Error cancelling appointment:", error);
        return null;
      }
      
      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw error;
    }
  },

  async deleteAppointment(id: number): Promise<boolean> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return false;
      }

      // Now delete the appointment, ensuring it belongs to the user's osteopath
      const { error } = await supabase
        .from("Appointment")
        .delete()
        .eq("id", id)
        .eq("osteopathId", userData.osteopathId);

      if (error) {
        console.error("Error deleting appointment:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  },
};
