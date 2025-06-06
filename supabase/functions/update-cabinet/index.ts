
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
    console.log('🔧 OPTIONS preflight request received');
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders
    });
  }

  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    console.log(`❌ Méthode ${req.method} non autorisée`);
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
    console.log('🔍 Début du traitement de la requête POST');
    console.log('🔍 Headers reçus:', Object.fromEntries(req.headers.entries()));
    
    // Lire le corps de la requête directement en JSON
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Corps de la requête reçu:', requestBody);
      console.log('📥 Type du corps:', typeof requestBody);
      console.log('📥 Clés du corps:', Object.keys(requestBody || {}));
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

    const { id: cabinetId, ...updateData } = requestBody;

    console.log(`🔧 POST request for cabinet ID: ${cabinetId}`);
    console.log('📝 Données à mettre à jour:', updateData);
    console.log('📝 Nombre de champs à mettre à jour:', Object.keys(updateData).length);

    if (!cabinetId) {
      console.log('❌ ID du cabinet manquant');
      return new Response(JSON.stringify({ 
        error: 'ID du cabinet requis dans le corps de la requête' 
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

    // Mettre à jour le cabinet dans la base de données
    const { data, error } = await supabase
      .from('Cabinet')
      .update(updateData)
      .eq('id', cabinetId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du cabinet:', error);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la mise à jour du cabinet',
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
      console.log('❌ Cabinet non trouvé avec ID:', cabinetId);
      return new Response(JSON.stringify({ 
        error: 'Cabinet non trouvé' 
      }), {
        status: 404,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });
    }

    console.log('✅ Cabinet mis à jour avec succès');
    console.log('✅ Données retournées:', data);

    // Retourner le cabinet mis à jour
    return new Response(JSON.stringify({ 
      data,
      message: 'Cabinet mis à jour avec succès' 
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('❌ Erreur dans la fonction update-cabinet:', error);
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
