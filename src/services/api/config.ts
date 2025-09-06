
// Configuration pour l'API

// Le délai simulé pour les réponses d'API (en ms)
export const DELAY = 300;

// Fonction utilitaire pour simuler un délai d'API
export const delay = (ms: number = DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration supprimée - Architecture hybride avec StorageRouter
// USE_SUPABASE remplacé par le routage automatique HDS/Non-HDS

// Les headers par défaut pour les appels API
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Mode de développement pour simuler l'authentification
// Ajoute des en-têtes pour contourner l'authentification lors du développement
export const SIMULATE_AUTH = true;
