
import { AppointmentStatus } from "@/types";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Export the supabase client
export const supabase = supabaseClient;

// Define AppointmentStatusValues array
export const AppointmentStatusValues: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELED", "RESCHEDULED"];

// Function to ensure the appointment status is one of the allowed enum values
export const ensureAppointmentStatus = (status: string): AppointmentStatus => {
  if (AppointmentStatusValues.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  } else {
    throw new Error(`Invalid appointment status: ${status}`);
  }
};

// Utility function to add authorization headers
// This is simplified as the Supabase SDK v2 automatically handles auth tokens
export const addAuthHeaders = async (query: any) => {
  return query;
};

// Utility function to handle typed data retrieval from Supabase
export const typedData = <T>(data: any): T => {
  return data as T;
};
