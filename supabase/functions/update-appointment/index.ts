
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Helper functions for consistent responses with CORS
function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
}

function createErrorResponse(error: string, status: number = 500) {
  return new Response(
    JSON.stringify({ success: false, error }),
    { 
      status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST and PATCH methods
  if (!['POST', 'PATCH'].includes(req.method)) {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Authorization header with Bearer token required', 401);
    }

    console.log('Authorization header found:', authHeader.substring(0, 20) + '...');

    // Créer le client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Vérifier l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return createErrorResponse('User not authenticated', 401);
    }

    console.log('User authenticated:', user.id);

    // Vérifier le Content-Type
    const contentType = req.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return createErrorResponse('Content-Type must be application/json', 400);
    }

    // Récupérer les données de la requête
    const body = await req.json();
    const { appointmentId, updateData } = body;
    
    if (!appointmentId) {
      return createErrorResponse('appointmentId is required', 400);
    }

    if (!updateData || typeof updateData !== 'object') {
      return createErrorResponse('updateData is required and must be an object', 400);
    }

    console.log(`Mise à jour du rendez-vous ${appointmentId} via Edge Function:`, updateData);

    // Préparer le payload de mise à jour
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Supprimer les champs undefined
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    console.log("Payload de mise à jour Edge Function:", updatePayload);

    // Effectuer la mise à jour
    const { data, error } = await supabase
      .from('Appointment')
      .update(updatePayload)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('[EDGE FUNCTION ERROR]', error);
      return createErrorResponse(error.message, 500);
    }

    console.log("Rendez-vous mis à jour via Edge Function:", data);

    return createSuccessResponse(data);

  } catch (error) {
    console.error('[EDGE FUNCTION CATCH ERROR]', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
