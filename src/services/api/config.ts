
// Configuration globale des API
export const USE_SUPABASE = true;
export const SIMULATE_AUTH = true; // Pour tester en mode développement sans authentification réelle

// Délai simulé pour les réponses d'API (en ms)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
