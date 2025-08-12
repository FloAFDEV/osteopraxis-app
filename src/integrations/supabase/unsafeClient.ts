import { supabase } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Untyped client to bypass strict generated types when using tables not yet in types
export const untypedSupabase = supabase as unknown as SupabaseClient<any>;
