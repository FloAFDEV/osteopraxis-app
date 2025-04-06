
// Utilitaires partagés pour les services Supabase API
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Type générique pour caster les résultats des requêtes Supabase
export type WithContraception<T> = T & { contraception: any };
export type WithStatus<T> = T & { status: any };

// Amélioration du client Supabase pour une meilleure gestion des erreurs
export const supabase = {
  ...supabaseClient,
  from: (table: string) => {
    console.log(`Accessing Supabase table: ${table}`);
    // Utiliser une assertion de type pour éviter les erreurs de compilation
    return supabaseClient.from(table as keyof Database['public']['Tables']);
  }
};

// Fonction d'aide pour le typage des résultats Supabase
export function typedData<T>(data: any): T {
  return data as T;
}

// Utilitaires pour le débogage
export const logSupabaseResponse = (data: any, error: any, operation: string) => {
  if (error) {
    console.error(`Supabase ${operation} error:`, error);
  } else {
    console.log(`Supabase ${operation} success:`, data);
  }
  
  // Return the data for convenience
  return { data, error };
};
