
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authentication token provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Create a Supabase client with the auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the user
    console.log("Getting user...");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ 
          error: 'Error getting user', 
          details: userError,
          auth: authHeader ? "Token present" : "No token"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse request body
    console.log("Parsing request body...");
    let type, data;
    try {
      const requestData = await req.json();
      type = requestData.type;
      data = requestData.data;
      console.log("Request data:", type, data);
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return new Response(
        JSON.stringify({ error: 'Error parsing request body', details: String(jsonError) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Access database with service role privileges
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );

    // Handle different data types
    let result;
    switch(type) {
      case 'patient':
        console.log("Creating patient with service role");
        const now = new Date().toISOString();
        
        // Ensure we have an osteopathId
        if (!data.osteopathId) {
          // Try to get the osteopathId from the User table first
          const { data: userData, error: userDataError } = await adminClient
            .from('User')
            .select('osteopathId')
            .eq('id', user.id)
            .maybeSingle();
            
          if (userDataError && userDataError.code !== 'PGRST116') {
            console.error('Error getting user data:', userDataError);
            throw userDataError;
          }
          
          if (userData && userData.osteopathId) {
            data.osteopathId = userData.osteopathId;
          } else {
            // If not found, try to get from Osteopath table
            const { data: osteopathData, error: osteopathError } = await adminClient
              .from('Osteopath')
              .select('id')
              .eq('userId', user.id)
              .maybeSingle();
              
            if (osteopathError && osteopathError.code !== 'PGRST116') {
              console.error('Error getting osteopath data:', osteopathError);
              throw osteopathError;
            }
            
            if (osteopathData && osteopathData.id) {
              data.osteopathId = osteopathData.id;
            } else {
              console.error('No osteopathId found for user');
              return new Response(
                JSON.stringify({ error: 'No osteopathId found for user' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
              )
            }
          }
        }
        
        // Create the patient
        const patientData = {
          ...data,
          createdAt: now,
          updatedAt: now
        };
        
        console.log("Creating patient with data:", patientData);
        
        const { data: patient, error: patientError } = await adminClient
          .from('Patient')
          .insert(patientData)
          .select()
          .single();
          
        if (patientError) {
          console.error('Error creating patient:', patientError);
          throw patientError;
        }
        
        result = { patient, operation: 'create', success: true };
        break;
        
      // Add more case handlers for other data types if needed
      
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported data type: ${type}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: error.message || String(error),
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
