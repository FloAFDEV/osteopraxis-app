
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔧 OPTIONS preflight request received for update-osteopath');
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders
    });
  }

  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    console.log(`❌ Méthode ${req.method} non autorisée pour update-osteopath`);
    return new Response(JSON.stringify({ 
      error: 'Méthode non autorisée. Seule la méthode POST est acceptée.' 
    }), {
      status: 405,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }

  try {
    console.log('🔍 Début du traitement de la requête POST update-osteopath');
    
    // Lire le body
    const bodyText = await req.text();
    console.log('📥 Corps de la requête reçu:', bodyText);
    
    if (!bodyText || bodyText.length === 0) {
      console.log('❌ Corps de requête vide');
      return new Response(JSON.stringify({ 
        error: 'Corps de requête vide' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Parser le JSON
    let requestBody;
    try {
      requestBody = JSON.parse(bodyText);
      console.log('📥 Corps parsé avec succès:', requestBody);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Format JSON invalide dans le corps de la requête',
        details: parseError.message
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    if (!requestBody || Object.keys(requestBody).length === 0) {
      console.log('❌ Corps de requête vide après parsing');
      return new Response(JSON.stringify({ 
        error: 'Données de mise à jour requises dans le corps de la requête' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    const { id: osteopathId, ...updateData } = requestBody;

    console.log(`🔧 POST request for osteopath ID: ${osteopathId}`);
    console.log('📝 Données à mettre à jour:', updateData);

    if (!osteopathId) {
      console.log('❌ ID de l\'ostéopathe manquant');
      return new Response(JSON.stringify({ 
        error: 'ID de l\'ostéopathe requis dans le corps de la requête' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('❌ Aucune donnée à mettre à jour');
      return new Response(JSON.stringify({ 
        error: 'Données de mise à jour requises dans le corps de la requête' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    // Créer le client Supabase avec la clé de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return new Response(JSON.stringify({ 
        error: 'Configuration serveur manquante' 
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ajouter updatedAt automatiquement
    updateData.updatedAt = new Date().toISOString();

    console.log('🔄 Tentative de mise à jour en base de données...');
    console.log('🔄 Données finales pour Supabase:', updateData);

    // Mettre à jour l'ostéopathe dans la base de données
    const { data, error } = await supabase
      .from('Osteopath')
      .update(updateData)
      .eq('id', osteopathId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'ostéopathe:', error);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la mise à jour de l\'ostéopathe',
        details: error.message 
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    if (!data) {
      console.log('❌ Ostéopathe non trouvé avec ID:', osteopathId);
      return new Response(JSON.stringify({ 
        error: 'Ostéopathe non trouvé' 
      }), {
        status: 404,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    console.log('✅ Ostéopathe mis à jour avec succès');
    console.log('✅ Données retournées:', data);

    // Retourner l'ostéopathe mis à jour
    return new Response(JSON.stringify({ 
      data,
      message: 'Ostéopathe mis à jour avec succès' 
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('❌ Erreur dans la fonction update-osteopath:', error);
    console.error('❌ Stack trace:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur interne',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
