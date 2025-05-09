
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from '@/integrations/supabase/client';
import { AppointmentStatus } from '@/types';

export { supabase, SUPABASE_API_URL, SUPABASE_API_KEY };

// Fonction pour le typage des données Supabase
export function typedData<T>(data: any): T {
  return data as T;
}

// Fonction pour s'assurer que le statut du rendez-vous est valide
export function ensureAppointmentStatus(status?: AppointmentStatus | null): AppointmentStatus {
  if (!status) {
    return 'SCHEDULED';
  }
  
  const validStatuses: AppointmentStatus[] = [
    'SCHEDULED', 
    'COMPLETED', 
    'CANCELED', 
    'NO_SHOW'
  ];
  
  if (validStatuses.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  }
  
  return 'SCHEDULED'; // Valeur par défaut
}

// Fonction pour supprimer les propriétés nulles d'un objet
export function removeNullProperties(obj: any): any {
  if (!obj) return {};
  
  const result: any = {};
  
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

// Exporter les cors headers pour les appels API
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
