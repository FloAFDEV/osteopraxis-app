// ⚠️ FONCTION DÉSACTIVÉE POUR CONFORMITÉ HDS
// La synchronisation Google Calendar est temporairement désactivée car elle pourrait
// exposer des données de rendez-vous patients (données de santé) vers Google Cloud.
//
// Pour réactiver en mode conforme :
// - Anonymiser complètement les événements (titre: "Rendez-vous", pas de description)
// - Ou implémenter chiffrement end-to-end avant transmission

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Google Calendar sync désactivée pour conformité HDS',
        message: 'Cette fonctionnalité est temporairement désactivée pour garantir que les données patients ne quittent pas le stockage local sécurisé.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503, // Service Unavailable
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
