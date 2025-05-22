
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Creates a standard Supabase client with user authentication
 */
export function createStandardClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
}

/**
 * Creates an admin client that bypasses RLS using the service role key
 */
export function createAdminClient() {
  // Vérification que la clé service_role est disponible
  if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    throw new Error("ERREUR CRITIQUE: La clé SUPABASE_SERVICE_ROLE_KEY n'est pas définie");
  }
  
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    { 
      auth: { 
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      }
    }
  );
}

/**
 * Formats a standard error response with CORS headers
 */
export function createErrorResponse(message: string, details: any = null, status = 500) {
  return new Response(
    JSON.stringify({ 
      error: message, 
      details: details
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status 
    }
  );
}

/**
 * Formats a successful response with CORS headers
 */
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
