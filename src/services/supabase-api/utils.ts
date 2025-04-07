
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SIMULATE_AUTH } from '../api/config';

// Importer le client depuis le fichier généré
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Exporter le client
export const supabase = supabaseClient;

// Type utilitaire pour les données typées
export const typedData = <T>(data: any): T => data as T;

// Fonction utilitaire pour ajouter des en-têtes d'authentification simulés
export const addAuthHeaders = <T extends { setHeader: (name: string, value: string) => T }>(query: T): T => {
  if (SIMULATE_AUTH) {
    return query.setHeader('X-Development-Mode', 'true');
  }
  return query;
};
