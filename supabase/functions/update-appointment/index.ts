
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

function createConflictResponse(conflictInfo: any) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      isConflict: true, 
      conflictInfo,
      error: "Un rendez-vous existe déjà sur ce créneau horaire pour cet ostéopathe."
    }),
    { 
      status: 409,
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

    // Rate limiting to protect the endpoint (15 min window)
    try {
      const { data: allowed, error: rlError } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_endpoint: 'edge/update-appointment',
        p_max_requests: 200,
        p_window_minutes: 15
      });
      if (!rlError && allowed === false) {
        return new Response(
          JSON.stringify({ success: false, error: 'Too many requests, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Retry-After': '900', 'Content-Type': 'application/json' } }
        );
      }
    } catch (_) {
      // ignore rate limit errors
    }


    // Parse le body JSON avec meilleure gestion d'erreur
    let body;
    try {
      const rawBody = await req.text();
      
      if (!rawBody || rawBody.trim() === '') {
        return createErrorResponse('Request body is required', 400);
      }
      
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return createErrorResponse(`Invalid JSON format: ${parseError.message}`, 400);
    }

    const { appointmentId, updateData } = body;
    
    if (!appointmentId) {
      return createErrorResponse('appointmentId is required', 400);
    }

    if (!updateData || typeof updateData !== 'object') {
      return createErrorResponse('updateData is required and must be an object', 400);
    }

    // Récupérer le rendez-vous actuel pour vérifier les conflits si la date change
    const { data: currentAppointment, error: currentAppError } = await supabase
      .from('Appointment')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (currentAppError || !currentAppointment) {
      return createErrorResponse('Appointment not found', 404);
    }

    // Si la date change, vérifier les conflits avant de tenter la mise à jour
    if (updateData.date && updateData.date !== currentAppointment.date) {
      const appointmentTime = new Date(updateData.date);
      const endTime = new Date(appointmentTime.getTime() + 60 * 60 * 1000); // 1 heure plus tard

      const { data: conflictingAppointments, error: conflictError } = await supabase
        .from('Appointment')
        .select(`
          id,
          date,
          patientId,
          reason,
          status,
          Patient:patientId (
            id,
            firstName,
            lastName,
            phone,
            email
          )
        `)
        .eq('osteopathId', currentAppointment.osteopathId)
        .neq('id', appointmentId)
        .not('status', 'in', '("CANCELED","NO_SHOW")')
        .gte('date', appointmentTime.toISOString())
        .lt('date', endTime.toISOString());

      if (conflictError) {
        console.error('Error checking conflicts:', conflictError);
        return createErrorResponse('Error checking appointment conflicts', 500);
      }

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        const conflictInfo = {
          conflictingAppointments: conflictingAppointments.map(apt => ({
            id: apt.id,
            date: apt.date,
            patientName: `${apt.Patient?.firstName} ${apt.Patient?.lastName}`,
            patientPhone: apt.Patient?.phone,
            patientEmail: apt.Patient?.email,
            reason: apt.reason,
            status: apt.status
          })),
          requestedDate: updateData.date,
          currentDate: currentAppointment.date
        };

        return createConflictResponse(conflictInfo);
      }
    }

    // Préparer le payload de mise à jour en excluant les champs sensibles
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Supprimer explicitement les champs interdits pour la sécurité
    delete updatePayload.id;
    delete updatePayload.osteopathId;
    delete updatePayload.userId;

    // Supprimer les champs undefined
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

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

    return createSuccessResponse(data);

  } catch (error) {
    console.error('[EDGE FUNCTION CATCH ERROR]', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
