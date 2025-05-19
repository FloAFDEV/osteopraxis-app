
// En-têtes CORS pour les réponses serveur uniquement (à ne pas utiliser côté client pour les requêtes)
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Cancellation-Override, X-HTTP-Method-Override, prefer',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
};
