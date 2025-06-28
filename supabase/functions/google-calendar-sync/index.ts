
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status: string;
  updated: string;
}

async function refreshTokenIfNeeded(supabaseClient: any, osteopathId: number) {
  const { data: tokenData } = await supabaseClient
    .from('google_calendar_tokens')
    .select('*')
    .eq('osteopath_id', osteopathId)
    .single()

  if (!tokenData) {
    throw new Error('Tokens Google non trouvés')
  }

  const expiresAt = new Date(tokenData.expires_at)
  const now = new Date()
  
  // If token expires within 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('Refreshing expired token')
    
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokenData.refresh_token,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        grant_type: 'refresh_token',
      }),
    })

    if (!refreshResponse.ok) {
      throw new Error('Échec du rafraîchissement du token')
    }

    const newTokens = await refreshResponse.json()
    const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString()

    await supabaseClient
      .from('google_calendar_tokens')
      .update({
        access_token: newTokens.access_token,
        expires_at: newExpiresAt,
      })
      .eq('osteopath_id', osteopathId)

    return newTokens.access_token
  }

  return tokenData.access_token
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

    if (req.method === 'POST') {
      // Sync calendar events
      const accessToken = await refreshTokenIfNeeded(supabaseClient, osteopath.id)
      
      // Get events from Google Calendar (next 30 days)
      const timeMin = new Date().toISOString()
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!calendarResponse.ok) {
        const error = await calendarResponse.text()
        console.error('Calendar API error:', error)
        return new Response(JSON.stringify({ error: 'Erreur lors de la récupération du calendrier' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const calendarData = await calendarResponse.json()
      const events: GoogleCalendarEvent[] = calendarData.items || []

      // Process and store events
      const processedEvents = events
        .filter(event => 
          event.start && 
          (event.start.dateTime || event.start.date) &&
          event.end &&
          (event.end.dateTime || event.end.date)
        )
        .map(event => ({
          osteopath_id: osteopath.id,
          google_event_id: event.id,
          summary: event.summary || 'Événement sans titre',
          description: event.description || null,
          start_time: event.start.dateTime || event.start.date,
          end_time: event.end.dateTime || event.end.date,
          location: event.location || null,
          status: event.status,
          last_modified: event.updated,
        }))

      // Upsert events (insert or update if exists)
      if (processedEvents.length > 0) {
        const { error: upsertError } = await supabaseClient
          .from('google_calendar_events')
          .upsert(processedEvents, {
            onConflict: 'osteopath_id,google_event_id',
          })

        if (upsertError) {
          console.error('Error upserting events:', upsertError)
          return new Response(JSON.stringify({ error: 'Erreur lors de la sauvegarde des événements' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        eventsProcessed: processedEvents.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      // Get stored calendar events
      const url = new URL(req.url)
      const startDate = url.searchParams.get('start')
      const endDate = url.searchParams.get('end')

      let query = supabaseClient
        .from('google_calendar_events')
        .select('*')
        .eq('osteopath_id', osteopath.id)
        .eq('status', 'confirmed')

      if (startDate) {
        query = query.gte('start_time', startDate)
      }
      if (endDate) {
        query = query.lte('end_time', endDate)
      }

      const { data: events, error } = await query.order('start_time')

      if (error) {
        console.error('Error fetching events:', error)
        return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des événements' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ events: events || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Calendar Sync Error:', error)
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
