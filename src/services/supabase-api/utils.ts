
// Utilitaires partagés pour les services Supabase API
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Type générique pour caster les résultats des requêtes Supabase
export type WithContraception<T> = T & { contraception: any };
export type WithStatus<T> = T & { status: any };

// Amélioration du client Supabase pour une meilleure gestion des erreurs
export const supabase = {
  ...supabaseClient,
  from: (table: string) => {
    console.log(`Accessing Supabase table: ${table}`);
    // Nous utilisons une assertion de type pour corriger l'erreur liée aux paramètres génériques
    return supabaseClient.from(table as any);
  }
};

// Utilitaires pour le débogage
export const logSupabaseResponse = (data: any, error: any, operation: string) => {
  if (error) {
    console.error(`Supabase ${operation} error:`, error);
  } else {
    console.log(`Supabase ${operation} success:`, data);
  }
};
