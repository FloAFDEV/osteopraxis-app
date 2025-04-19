
// Configuration for the Supabase API

// Export for use in other modules
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Use real authentication - we set this to false to ensure real auth is used
export const USE_SUPABASE = true;
export const SIMULATE_AUTH = false;
