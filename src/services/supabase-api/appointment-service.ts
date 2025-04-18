
import { Appointment, AppointmentStatus } from "@/types";
import { supabase } from "./utils";
import { checkAuth } from "./utils";

// Adapter function to convert Supabase data to our Appointment type
const adaptAppointmentFromSupabase = (data: any): Appointment => ({
  id: data.id,
  date: data.date,
  patientId: data.patientId,
  reason: data.reason,
  notificationSent: data.notificationSent || false,
  status: convertDbStatusToAppStatus(data.status)
});

// Convert Supabase status (CANCELED) to our app status (CANCELLED)
const convertAppStatusToDbStatus = (status: AppointmentStatus): string => {
  if (status === "CANCELLED") {
    return "CANCELED";
  }
  return status;
};

// Convert our app status (CANCELLED) to Supabase status (CANCELED)
const convertDbStatusToAppStatus = (status: string): AppointmentStatus => {
  if (status === "CANCELED") {
    return "CANCELLED";
  }
  return status as AppointmentStatus;
};

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      // Check authentication before proceeding
      const session = await checkAuth();
      console.log("Fetching appointments with authenticated user:", session.user.id);

      // Check if the user is an admin first
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user role:', userError);
        throw userError;
      }

      // If the user is an admin, return all appointments
      if (userData && userData.role === 'ADMIN') {
        console.log("Admin user detected, fetching all appointments");
        const { data, error } = await supabase
          .from('Appointment')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching appointments as admin:', error);
          throw error;
        }

        console.log(`Successfully fetched ${data?.length || 0} appointments as admin`);
        return (data || []).map(adaptAppointmentFromSupabase);
      }

      // If not admin, try to get osteopath ID
      const { data: osteopathData, error: osteopathError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', session.user.id)
        .maybeSingle();

      // If no osteopath found, return empty array
      if (osteopathError) {
        if (osteopathError.code === 'PGRST116') {
          console.log('No osteopath found for this user, returning empty appointments list');
          return [];
        }
        console.error('Error fetching osteopath id:', osteopathError);
        throw osteopathError;
      }

      if (!osteopathData || !osteopathData.id) {
        console.log('No osteopath ID found, returning empty appointments list');
        return [];
      }

      // Get patients for this osteopath
      const { data: patients, error: patientsError } = await supabase
        .from('Patient')
        .select('id')
        .eq('osteopathId', osteopathData.id);

      if (patientsError) {
        console.error('Error fetching patient ids for osteopath:', patientsError);
        throw patientsError;
      }

      if (!patients || patients.length === 0) {
        console.log('No patients found for this osteopath, returning empty appointments list');
        return [];
      }

      // Get patient IDs
      const patientIds = patients.map(p => p.id);
      console.log(`Fetching appointments for ${patientIds.length} patients of osteopath ID ${osteopathData.id}`);

      // Fetch appointments for these patients
      const { data, error } = await supabase
        .from('Appointment')
        .select('*')
        .in('patientId', patientIds)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} appointments`);
      return (data || []).map(adaptAppointmentFromSupabase);
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  },

  async getAppointmentById(id: number): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('Appointment')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching appointment by id:', error);
        throw error;
      }

      return data ? adaptAppointmentFromSupabase(data) : null;
    } catch (error) {
      console.error('Error in getAppointmentById:', error);
      throw error;
    }
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('Appointment')
        .select('*')
        .eq('patientId', patientId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments by patientId:', error);
        throw error;
      }

      return (data || []).map(adaptAppointmentFromSupabase);
    } catch (error) {
      console.error('Error in getAppointmentsByPatientId:', error);
      throw error;
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      // Convert the appointment status for Supabase
      const supabaseAppointment = {
        date: appointment.date,
        patientId: appointment.patientId,
        reason: appointment.reason,
        status: convertAppStatusToDbStatus(appointment.status),
        notificationSent: appointment.notificationSent
      };

      const { data, error } = await supabase
        .from('Appointment')
        .insert(supabaseAppointment)
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      return adaptAppointmentFromSupabase(data);
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      // Convert the appointment status for Supabase if it exists
      const supabaseAppointment = {
        ...appointment,
        status: appointment.status ? convertAppStatusToDbStatus(appointment.status) : undefined
      };

      const { data, error } = await supabase
        .from('Appointment')
        .update(supabaseAppointment)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }

      return data ? adaptAppointmentFromSupabase(data) : undefined;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  },

  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Appointment')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      throw error;
    }
  }
};

export default supabaseAppointmentService;
