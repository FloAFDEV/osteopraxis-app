
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "../../integrations/supabase/client";
import { AppointmentStatus } from "@/types";

// Fonction de typage des données
const typedData = <T>(data: any): T => data as T;

// Valeurs valides pour le statut des rendez-vous
export const AppointmentStatusValues = [
  "SCHEDULED", 
  "COMPLETED", 
  "CANCELED",
  "RESCHEDULED", 
  "NO_SHOW",
  "IN_PROGRESS"
] as const;

/**
 * Vérifie et normalise le statut d'un rendez-vous
 * @param status Statut à vérifier
 * @returns Statut normalisé et validé
 */
export const ensureAppointmentStatus = (status?: string): AppointmentStatus => {
  // Normaliser le statut en majuscules
  const normalizedStatus = status?.toUpperCase();
  
  // Corriger le cas particulier "CANCELLED" (orthographe UK) vers "CANCELED" (orthographe US)
  if (normalizedStatus === "CANCELLED") {
    return "CANCELED";
  }
  
  // Vérifier si le statut est valide
  if (normalizedStatus && AppointmentStatusValues.includes(normalizedStatus as AppointmentStatus)) {
    return normalizedStatus as AppointmentStatus;
  }
  
  // Par défaut, retourner SCHEDULED
  return "SCHEDULED";
};

export { 
  supabase, 
  typedData,
  SUPABASE_API_URL,
  SUPABASE_API_KEY
};
