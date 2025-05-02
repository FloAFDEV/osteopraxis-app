
import { supabase as supabaseClient, SUPABASE_API_URL as apiUrl, SUPABASE_API_KEY as apiKey } from "@/integrations/supabase/client";
import { AppointmentStatus } from "@/types";

// Re-export du client supabase pour utilisation dans les services
export const supabase = supabaseClient;

// Re-export des constantes d'URL et clé API pour les appels directs à l'API Supabase
export const SUPABASE_API_URL = apiUrl;
export const SUPABASE_API_KEY = apiKey;

/**
 * Utilitaire pour typer correctement les données provenant de Supabase
 */
export function typedData<T>(data: any): T {
  return data as T;
}

/**
 * Vérifie et normalise le statut d'un rendez-vous
 * @param status Le statut à vérifier
 * @returns Le statut normalisé
 */
export function ensureAppointmentStatus(status: string | undefined): AppointmentStatus {
  if (!status) return "SCHEDULED";
  
  // Normalisation des valeurs connues
  switch (status.toUpperCase()) {
    case 'SCHEDULED': return "SCHEDULED";
    case 'COMPLETED': return "COMPLETED";
    case 'CANCELED': 
    case 'CANCELLED': return "CANCELED";
    case 'RESCHEDULED': return "RESCHEDULED";
    case 'NO_SHOW': return "NO_SHOW";
    default: return "SCHEDULED"; // Valeur par défaut
  }
}

// Valeurs de statut de rendez-vous valides
export const AppointmentStatusValues = ["SCHEDULED", "COMPLETED", "CANCELED", "RESCHEDULED", "NO_SHOW"] as const;
