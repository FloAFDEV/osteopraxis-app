
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "../../integrations/supabase/client";

// Fonction de typage des données
const typedData = <T>(data: any): T => data as T;

export { 
  supabase, 
  typedData,
  SUPABASE_API_URL,
  SUPABASE_API_KEY
};
