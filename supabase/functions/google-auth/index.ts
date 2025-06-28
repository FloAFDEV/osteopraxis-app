
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get current osteopath
    const { data: osteopath } = await supabaseClient
      .from('Osteopath')
      .select('id')
      .eq('authId', user.id)
      .single()

    if (!osteopath) {
      return new Response(JSON.stringify({ error: 'Profil ostéopathe non trouvé' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get osteopath's API keys
    const { data: apiKeys } = await supabaseClient
      .from('google_api_keys')
      .select('client_id, client_secret')
      .eq('osteopath_id', osteopath.id)
      .single()

    if (!apiKeys) {
      return new Response(JSON.stringify({ error: 'Clés API Google non configurées' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const { code, state } = await req.json()

      // Exchange authorization code for tokens using osteopath's keys
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: apiKeys.client_id,
          client_secret: apiKeys.client_secret,
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-auth/callback`,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        console.error('Token exchange failed:', error)
        return new Response(JSON.stringify({ error: 'Échec de l\'authentification Google' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const tokens: GoogleTokenResponse = await tokenResponse.json()

      // Store tokens
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      
      const { error: tokenError } = await supabaseClient
        .from('google_calendar_tokens')
        .upsert({
          osteopath_id: osteopath.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || '',
          expires_at: expiresAt,
          scope: tokens.scope,
        })

      if (tokenError) {
        console.error('Error storing tokens:', tokenError)
        return new Response(JSON.stringify({ error: 'Erreur lors de la sauvegarde des tokens' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      
      if (url.pathname.endsWith('/callback')) {
        // Handle OAuth callback redirect
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        
        if (!code) {
          return new Response('Code d\'autorisation manquant', { status: 400 })
        }

        // Redirect to frontend with code
        const frontendUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/settings/profile?google_code=${code}&state=${state}`
        
        return new Response(null, {
          status: 302,
          headers: { 
            ...corsHeaders, 
            'Location': frontendUrl 
          },
        })
      }

      if (url.pathname.endsWith('/url')) {
        // Generate OAuth URL using osteopath's client ID
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.set('client_id', apiKeys.client_id)
        authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-auth/callback`)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly')
        authUrl.searchParams.set('access_type', 'offline')
        authUrl.searchParams.set('prompt', 'consent')
        authUrl.searchParams.set('state', user.id)

        return new Response(JSON.stringify({ url: authUrl.toString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Google Auth Error:', error)
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
