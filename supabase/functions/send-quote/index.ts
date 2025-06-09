
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Récupérer l'utilisateur authentifié
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { quoteId } = await req.json()

    if (!quoteId) {
      return new Response(JSON.stringify({ error: 'ID de devis manquant' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Envoi du devis:', quoteId)

    // Récupérer l'osteopath
    const { data: osteopath, error: osteopathError } = await supabase
      .from('Osteopath')
      .select('id')
      .eq('userId', user.id)
      .single()

    if (osteopathError || !osteopath) {
      return new Response(JSON.stringify({ error: 'Profil ostéopathe non trouvé' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Récupérer le devis avec le patient
    const { data: quote, error: quoteError } = await supabase
      .from('Quote')
      .select(`
        *,
        items:QuoteItem(*),
        Patient!inner(firstName, lastName, email)
      `)
      .eq('id', quoteId)
      .eq('osteopathId', osteopath.id)
      .single()

    if (quoteError || !quote) {
      console.error('Erreur récupération devis:', quoteError)
      return new Response(JSON.stringify({ error: 'Devis non trouvé' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Vérifier que le devis peut être envoyé
    if (quote.status !== 'DRAFT') {
      return new Response(JSON.stringify({ error: 'Ce devis ne peut plus être envoyé' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Mettre à jour le statut du devis à "SENT"
    const { error: updateError } = await supabase
      .from('Quote')
      .update({ 
        status: 'SENT',
        updatedAt: new Date().toISOString()
      })
      .eq('id', quoteId)
      .eq('osteopathId', osteopath.id)

    if (updateError) {
      console.error('Erreur mise à jour statut devis:', updateError)
      return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour du devis' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // TODO: Ici on pourrait ajouter l'envoi d'email au patient
    // Pour l'instant on simule juste l'envoi
    console.log(`Devis ${quoteId} marqué comme envoyé pour le patient ${quote.Patient.firstName} ${quote.Patient.lastName}`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Devis envoyé avec succès' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erreur envoi devis:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
