
import { supabase } from "../utils";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { Appointment } from "@/types";
import { getCurrentUserOsteopathId } from "./appointment-utils";
import { AppointmentInsertData, AppointmentStatus, AppointmentUpdateData } from "./appointment-types";

/**
 * Create a new appointment
 */
export async function createAppointment(appointmentData: Omit<Appointment, "id">): Promise<Appointment> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    const insertData: AppointmentInsertData = {
      patientId: appointmentData.patientId,
      date: appointmentData.date,
      reason: appointmentData.reason || "",
      status: appointmentData.status as AppointmentStatus,
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
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
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
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: number): Promise<Appointment | null> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    const { data, error } = await supabase
      .from("Appointment")
      .update({ status: "CANCELED" as AppointmentStatus })
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
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: number): Promise<boolean> {
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
}
