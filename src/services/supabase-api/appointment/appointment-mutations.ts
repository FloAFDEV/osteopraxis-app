
import { supabaseRaw } from "@/integrations/supabase/client-raw";
import { Appointment } from "@/types";
import { adaptAppointmentFromSupabase } from "../appointment-adapter";
import { toast } from "sonner";
import { getCurrentUserOsteopathId } from "./appointment-utils";
import { AppointmentInsertData, AppointmentStatus, AppointmentUpdateData } from "./appointment-types";
import { AppointmentRow } from "./appointment-queries";

/**
 * Create a new appointment
 */
export async function createAppointment(appointmentData: Omit<Appointment, "id">): Promise<Appointment> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();

    // S'assurer que le status est bien du type AppointmentStatus
    const status = appointmentData.status as AppointmentStatus;
    
    const insertData: AppointmentInsertData = {
      patientId: appointmentData.patientId,
      date: appointmentData.date,
      reason: appointmentData.reason,
      status,
      notificationSent: appointmentData.notificationSent || false,
      notes: appointmentData.notes,
      cabinetId: appointmentData.cabinetId,
      osteopathId
    };

    const { data, error } = await supabaseRaw
      .from("Appointment")
      .insert(insertData)
      .select();

    if (error) {
      toast.error("Erreur lors de la création du rendez-vous");
      throw error;
    }
    
    toast.success("Rendez-vous créé avec succès");
    
    if (!data || data.length === 0) {
      throw new Error("Aucune donnée retournée après création");
    }
    
    return adaptAppointmentFromSupabase(data[0] as AppointmentRow);
  } catch (error) {
    console.error("Error in createAppointment:", error);
    throw error;
  }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
  try {
    // Vérifier que l'utilisateur est autorisé à mettre à jour ce rendez-vous
    const osteopathId = await getCurrentUserOsteopathId();
    
    // Préparer les données à mettre à jour
    const updateData: AppointmentUpdateData = {};
    
    if (appointmentData.patientId !== undefined) updateData.patientId = appointmentData.patientId;
    if (appointmentData.date !== undefined) updateData.date = appointmentData.date;
    if (appointmentData.reason !== undefined) updateData.reason = appointmentData.reason;
    if (appointmentData.status !== undefined) updateData.status = appointmentData.status as AppointmentStatus;
    if (appointmentData.notificationSent !== undefined) updateData.notificationSent = appointmentData.notificationSent;
    if (appointmentData.notes !== undefined) updateData.notes = appointmentData.notes;
    if (appointmentData.cabinetId !== undefined) updateData.cabinetId = appointmentData.cabinetId;

    const { data, error } = await supabaseRaw
      .from("Appointment")
      .update(updateData)
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .select()
      .single();
    
    if (error) {
      toast.error("Erreur lors de la mise à jour du rendez-vous");
      throw error;
    }
    
    toast.success("Rendez-vous mis à jour avec succès");
    
    if (!data) {
      throw new Error("Aucune donnée retournée après mise à jour");
    }
    
    return adaptAppointmentFromSupabase(data as AppointmentRow);
  } catch (error) {
    console.error("Error in updateAppointment:", error);
    throw error;
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: number, reason?: string): Promise<Appointment> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();
    
    const { data, error } = await supabaseRaw
      .from("Appointment")
      .update({ 
        status: "CANCELED" as AppointmentStatus,
        notes: reason || "Annulé sans raison spécifiée"
      })
      .eq("id", id)
      .eq("osteopathId", osteopathId)
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de l'annulation du rendez-vous");
      throw error;
    }
    
    toast.success("Rendez-vous annulé avec succès");
    
    if (!data) {
      throw new Error("Aucune donnée retournée après annulation");
    }
    
    return adaptAppointmentFromSupabase(data as AppointmentRow);
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    throw error;
  }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: number): Promise<void> {
  try {
    const osteopathId = await getCurrentUserOsteopathId();
    
    const { error } = await supabaseRaw
      .from("Appointment")
      .delete()
      .eq("id", id)
      .eq("osteopathId", osteopathId);

    if (error) {
      toast.error("Erreur lors de la suppression du rendez-vous");
      throw error;
    }
    
    toast.success("Rendez-vous supprimé avec succès");
  } catch (error) {
    console.error("Error in deleteAppointment:", error);
    throw error;
  }
}
