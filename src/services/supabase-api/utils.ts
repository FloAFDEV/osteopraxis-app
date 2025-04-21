

import { AppointmentStatus } from "@/types";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Export the supabase client
export const supabase = supabaseClient;

// Define AppointmentStatusValues array
export const AppointmentStatusValues: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"];

// Function to ensure the appointment status is one of the allowed enum values
export const ensureAppointmentStatus = (status: string): AppointmentStatus => {
  if (AppointmentStatusValues.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  } else {
    throw new Error(`Invalid appointment status: ${status}`);
  }
};

// Function to add authorization headers to a Supabase request
// and ensure that PATCH, DELETE methods are allowed
export const addAuthHeaders = async (query: any) => {
  // Get the current session's authentication token
  const sessionData = await supabase.auth.getSession();
  
  // Get the Supabase anon key from the client instance
  const supabaseKey = supabaseClient.supabaseKey;
  
  // Configure headers to explicitly allow PATCH, DELETE and other methods
  // This resolves the CORS "Method PATCH is not allowed by Access-Control-Allow-Methods" error
  query.headers({
    'Authorization': `Bearer ${sessionData.data?.session?.access_token || ''}`,
    'apikey': supabaseKey || '',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Prefer': 'return=representation'
  });
  
  return query;
};

// Utility function to handle typed data retrieval from Supabase
export const typedData = <T>(data: any): T => {
  return data as T;
};

