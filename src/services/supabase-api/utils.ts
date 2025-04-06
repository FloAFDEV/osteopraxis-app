
// Utilitaires partagés pour les services Supabase API
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { SIMULATE_AUTH } from "../api/config";

// Type générique pour caster les résultats des requêtes Supabase
export type WithContraception<T> = T & { contraception: any };
export type WithStatus<T> = T & { status: any };

// Amélioration du client Supabase pour une meilleure gestion des erreurs et autorisation en mode développement
export const supabase = {
  ...supabaseClient,
  from: (table: string) => {
    console.log(`Accessing Supabase table: ${table}`);
    
    // Créer une requête de base
    const query = supabaseClient.from(table as keyof Database['public']['Tables']);
    
    // Si SIMULATE_AUTH est actif, ajoutons des en-têtes pour simuler un utilisateur authentifié en mode développement
    if (SIMULATE_AUTH) {
      // Note: Ceci est une tentative de contournement pour le développement mais ne remplace pas une vraie authentification
      // Les politiques RLS sur Supabase ne seront pas activées par cela, c'est juste pour le développement local
      console.log("Mode développement: authentification simulée activée");
    }
    
    return query;
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
  
  return { data, error };
};
