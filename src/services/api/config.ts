
// Configuration et constantes partagées pour l'API

// Variable pour indiquer si on doit utiliser Supabase ou les données simulées
export const USE_SUPABASE = true;

// Simule des délais de réseau pour les données de test
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
