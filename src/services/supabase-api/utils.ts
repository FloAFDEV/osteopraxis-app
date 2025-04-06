
// Utilitaires partagés pour les services Supabase API
import { supabase } from "@/integrations/supabase/client";

// Type générique pour caster les résultats des requêtes Supabase
export type WithContraception<T> = T & { contraception: any };
export type WithStatus<T> = T & { status: any };

export { supabase };
