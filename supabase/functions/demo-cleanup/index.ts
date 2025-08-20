import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧹 Démarrage du nettoyage automatique des données de démonstration...')
    
    // Appeler la fonction de nettoyage de la base de données
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_expired_demo_sessions')
    
    if (cleanupError) {
      console.error('❌ Erreur lors du nettoyage:', cleanupError)
      throw cleanupError
    }
    
    console.log('📊 Résultats du nettoyage:', cleanupResult)
    
    // Nettoyer aussi les données locales expirées (localStorage) via une requête de nettoyage général
    const { data: generalCleanup, error: generalError } = await supabase
      .rpc('enhanced_cleanup_system')
    
    if (generalError) {
      console.warn('⚠️ Avertissement nettoyage général:', generalError)
    }
    
    const finalResult = {
      timestamp: new Date().toISOString(),
      database_cleanup: cleanupResult || [],
      general_cleanup: generalCleanup || 0,
      status: 'success',
      message: 'Nettoyage automatique des données de démonstration terminé'
    }
    
    console.log('✅ Nettoyage terminé avec succès:', finalResult)
    
    return new Response(
      JSON.stringify(finalResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('❌ Erreur critique lors du nettoyage:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors du nettoyage des données de démonstration',
        details: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})