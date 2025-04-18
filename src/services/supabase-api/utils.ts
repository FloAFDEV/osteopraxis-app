
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { SIMULATE_AUTH } from "../api/config";

// Export supabase client
export const supabase = supabaseClient;

// Ajouter des en-têtes d'authentification aux requêtes pour contourner les restrictions RLS en développement
export function addAuthHeaders(query: any) {
  if (SIMULATE_AUTH) {
    // Simuler un utilisateur authentifié avec le rôle 'authenticated'
    // Ceci ne fonctionne qu'en développement local avec RLS désactivé
    query.headers({
      Authorization: "Bearer simulated-jwt-token",
      "x-supabase-auth": "simulated-auth"
    });
  }
  return query;
}

// Fonction utilitaire pour garantir que le statut de l'appointement est une valeur d'enum valide
export const AppointmentStatusValues = ["SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW", "RESCHEDULED"];
export function ensureAppointmentStatus(status: any) {
  if (typeof status === 'string' && AppointmentStatusValues.includes(status)) {
    return status;
  }
  // Valeur par défaut si le statut n'est pas valide
  return "SCHEDULED";
}

// Fonction utilitaire pour typer correctement les données de Supabase
export function typedData<T>(data: any): T {
  return data as T;
}
