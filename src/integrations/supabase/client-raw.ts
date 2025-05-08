
// This file creates an untyped version of the Supabase client
// to avoid TypeScript's excessive type inference (TS2589)
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_API_URL, SUPABASE_API_KEY } from './client';

// Create a client without the Database generic type parameter
export const supabaseRaw = createClient(SUPABASE_API_URL, SUPABASE_API_KEY);
