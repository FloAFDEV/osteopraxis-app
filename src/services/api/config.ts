
// Configuration pour les API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mode Supabase activé par défaut, avec fallback sur données simulées en cas d'erreur
export const USE_SUPABASE = true; 

// Activation du mode fallback qui permet d'utiliser des données simulées si Supabase échoue
export const USE_FALLBACK = true;
