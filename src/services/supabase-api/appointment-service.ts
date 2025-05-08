
import { Appointment, AppointmentStatus } from "@/types";
import { supabase } from "./utils";
import { adaptAppointmentFromSupabase } from "./appointment-adapter";

// Simple flat type definition to avoid deep type instantiation
type AppointmentData = {
  patientId: number;
  date: string;
  reason: string;
  status: string; // Using string instead of AppointmentStatus enum to avoid complex type inference
  osteopathId: number;
  notificationSent?: boolean;
  notes?: string;
  cabinetId?: number | null;
};

/**
 * Get current user's osteopath ID
 */
async function getCurrentUserOsteopathId(): Promise<number> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("No authenticated session");
  }

  const { data: userData, error: userError } = await supabase
    .from("User")
    .select("osteopathId")
    .eq("id", session.session.user.id)
    .single();

  if (userError || !userData || !userData.osteopathId) {
    console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
    throw new Error("Unable to get osteopath ID");
  }

  return userData.osteopathId;
}

export const supabaseAppointmentService = {
  /**
   * Get all appointments for the current osteopath
   */
  async getAppointments(): Promise<Appointment[]> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("osteopathId", osteopathId)
        .order("date", { ascending: true });

      if (error) throw error;
      
      return (data || []).map((item: any) => adaptAppointmentFromSupabase(item));
    } catch (error) {
      console.error("Error in getAppointments:", error);
      throw error;
    }
  },

  /**
   * Get a specific appointment by ID
   */
  async getAppointmentById(id: number): Promise<Appointment | null> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("id", id)
        .eq("osteopathId", osteopathId)
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

  /**
   * Get appointments for a specific patient
   */
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("patientId", patientId)
        .eq("osteopathId", osteopathId)
        .order("date", { ascending: true });

      if (error) throw error;
      
      return (data || []).map((item: any) => adaptAppointmentFromSupabase(item));
    } catch (error) {
      console.error("Error in getAppointmentsByPatientId:", error);
      throw error;
    }
  },
  
  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: Omit<Appointment, "id">): Promise<Appointment> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      // Create simple object with primitive types to avoid deep type instantiation
      const insertData: AppointmentData = {
        patientId: appointmentData.patientId,
        date: appointmentData.date,
        reason: appointmentData.reason || "",
        status: appointmentData.status,
        osteopathId: osteopathId,
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

  /**
   * Update an existing appointment
   */
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      // Use a simple Record type to avoid deep type inference issues
      const updateData: Record<string, any> = {};
      
      if (appointmentData.patientId !== undefined) updateData.patientId = appointmentData.patientId;
      if (appointmentData.date !== undefined) updateData.date = appointmentData.date;
      if (appointmentData.reason !== undefined) updateData.reason = appointmentData.reason;
      if (appointmentData.status !== undefined) updateData.status = appointmentData.status;
      if (appointmentData.notificationSent !== undefined) updateData.notificationSent = appointmentData.notificationSent;
      if (appointmentData.notes !== undefined) updateData.notes = appointmentData.notes;
      if (appointmentData.cabinetId !== undefined) updateData.cabinetId = appointmentData.cabinetId;

      const { data, error } = await supabase
        .from("Appointment")
        .update(updateData)
        .eq("id", id)
        .eq("osteopathId", osteopathId)
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

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: number): Promise<Appointment | null> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      const { data, error } = await supabase
        .from("Appointment")
        .update({ status: "CANCELED" })
        .eq("id", id)
        .eq("osteopathId", osteopathId)
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

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const osteopathId = await getCurrentUserOsteopathId();

      const { error } = await supabase
        .from("Appointment")
        .delete()
        .eq("id", id)
        .eq("osteopathId", osteopathId);

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
