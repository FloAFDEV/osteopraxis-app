
// Configuration for the Supabase API

import { delay, USE_SUPABASE } from "../api/config";

// Adding SIMULATE_AUTH flag to match what's used in the rest of the application
export const SIMULATE_AUTH = false;

// Export for use in other modules
export { delay, USE_SUPABASE, SIMULATE_AUTH };
