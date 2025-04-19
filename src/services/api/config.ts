
// Configuration for API services

// Set to true to use Supabase, false to use mock data
export const USE_SUPABASE = true;

// Simulate network delay for mock API (milliseconds)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Set SIMULATE_AUTH to false to use real authentication - no duplicate declaration
// SIMULATE_AUTH is now defined only in supabase-api/config.ts
