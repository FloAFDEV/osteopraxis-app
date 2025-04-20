import { AppointmentStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Function to ensure the appointment status is one of the allowed enum values
export const ensureAppointmentStatus = (status: string): AppointmentStatus => {
  const AppointmentStatusValues: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"];
  if (AppointmentStatusValues.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  } else {
    throw new Error(`Invalid appointment status: ${status}`);
  }
};

// Fonction mise à jour pour ajouter les en-têtes d'autorisation à une requête Supabase
// et s'assurer que les méthodes PATCH, DELETE sont autorisées
export const addAuthHeaders = (query: any) => {
  // Récupérer le token d'authentification de la session courante
  const session = supabase.auth.getSession();
  
  // Configurer les en-têtes pour autoriser explicitement PATCH, DELETE et autres méthodes
  // Cela résout le problème CORS "Method PATCH is not allowed by Access-Control-Allow-Methods"
  query.headers({
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': supabase.supabaseKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Prefer': 'return=representation'
  });
  
  return query;
};

// Utility function to handle typed data retrieval from Supabase
export const typedData = async <T>(query: any): Promise<T[]> => {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
  return (data || []) as T[];
};
