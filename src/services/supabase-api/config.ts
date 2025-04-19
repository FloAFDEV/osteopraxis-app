
// Configuration for the Supabase API

import { delay } from "../api/config";

// Export for use in other modules
export { delay };

// Use real authentication - we set this to false to ensure real auth is used
export const USE_SUPABASE = true;
export const SIMULATE_AUTH = false;
