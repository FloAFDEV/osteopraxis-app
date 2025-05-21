
// Configuration pour l'API

// Le délai simulé pour les réponses d'API (en ms)
export const DELAY = 300;

// Fonction utilitaire pour simuler un délai d'API
export const delay = (ms: number = DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Active l'utilisation de Supabase au lieu de l'API simulée
export const USE_SUPABASE = true;

// Configuration des endpoints API avec la nouvelle nomenclature Supabase
export const API_CONFIG = {
  // Ces valeurs seront remplacées par des variables d'environnement dans le futur
  SUPABASE_URL: "https://jpjuvzpqfirymtjwnier.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanV2enBxZmlyeW10anduaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2Mzg4MjIsImV4cCI6MjA0NDIxNDgyMn0.VUmqO5zkRxr1Xucv556GStwCabvZrRckzIzXVPgAthQ"
};

// Les headers par défaut pour les appels API
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Mode de développement pour simuler l'authentification
// Ajoute des en-têtes pour contourner l'authentification lors du développement
export const SIMULATE_AUTH = true;
