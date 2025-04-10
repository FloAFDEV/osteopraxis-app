
// Configuration pour l'API
// Le délai simulé pour les réponses d'API (en ms)
export const DELAY = 300;

// Fonction utilitaire pour simuler un délai d'API
export const delay = (ms: number = DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Active l'utilisation de Supabase au lieu de l'API simulée
// Temporairement désactivé pour le débogage
export const USE_SUPABASE = false;

// Mode de développement pour simuler l'authentification
// Ajoute des en-têtes pour contourner l'authentification lors du développement
export const SIMULATE_AUTH = true;
