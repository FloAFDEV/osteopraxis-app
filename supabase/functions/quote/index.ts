
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create supabase client with user's auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const quoteId = pathParts[pathParts.length - 1];

    console.log('Quote operation:', { method: req.method, quoteId, pathname: url.pathname });

    switch (req.method) {
      case 'GET':
        if (quoteId && !isNaN(Number(quoteId))) {
          // Get single quote by ID
          const { data, error } = await supabase
            .from('Quote')
            .select(`
              *,
              Patient!patientId (firstName, lastName),
              QuoteItem (*)
            `)
            .eq('id', quoteId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get quotes by patient ID from query params
          const patientId = url.searchParams.get('patientId');
          if (!patientId) {
            throw new Error('Patient ID is required');
          }

          const { data, error } = await supabase
            .from('Quote')
            .select(`
              *,
              Patient!patientId (firstName, lastName),
              QuoteItem (*)
            `)
            .eq('patientId', patientId)
            .order('createdAt', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const createData = await req.json();
        console.log('Creating quote:', createData);

        const { data: newQuote, error: createError } = await supabase
          .from('Quote')
          .insert(createData)
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify(newQuote), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PATCH':
        if (!quoteId || isNaN(Number(quoteId))) {
          throw new Error('Valid quote ID is required for update');
        }

        const updateData = await req.json();
        console.log('Updating quote:', { quoteId, updateData });

        const { data: updatedQuote, error: updateError } = await supabase
          .from('Quote')
          .update(updateData)
          .eq('id', quoteId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updatedQuote), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!quoteId || isNaN(Number(quoteId))) {
          throw new Error('Valid quote ID is required for deletion');
        }

        const { error: deleteError } = await supabase
          .from('Quote')
          .delete()
          .eq('id', quoteId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response('Method not allowed', {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error('Error in quote function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
