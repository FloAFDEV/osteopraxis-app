
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    // Récupérer l'osteopath associé à l'utilisateur
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

    const url = new URL(req.url)
    const method = req.method
    const pathParts = url.pathname.split('/').filter(Boolean)
    const quoteId = pathParts[pathParts.length - 1]

    console.log('Quote API:', method, url.pathname, { quoteId, osteopathId: osteopath.id })

    switch (method) {
      case 'GET':
        if (url.searchParams.get('patientId')) {
          // Récupérer les devis d'un patient
          const patientId = url.searchParams.get('patientId')
          const { data: quotes, error } = await supabase
            .from('Quote')
            .select(`
              *,
              items:QuoteItem(*)
            `)
            .eq('patientId', patientId)
            .eq('osteopathId', osteopath.id)
            .order('createdAt', { ascending: false })

          if (error) {
            console.error('Erreur récupération devis patient:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(quotes || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else if (quoteId && !isNaN(Number(quoteId))) {
          // Récupérer un devis spécifique
          const { data: quote, error } = await supabase
            .from('Quote')
            .select(`
              *,
              items:QuoteItem(*)
            `)
            .eq('id', quoteId)
            .eq('osteopathId', osteopath.id)
            .single()

          if (error) {
            console.error('Erreur récupération devis:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(quote), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Récupérer tous les devis de l'ostéopathe
          const { data: quotes, error } = await supabase
            .from('Quote')
            .select(`
              *,
              items:QuoteItem(*)
            `)
            .eq('osteopathId', osteopath.id)
            .order('createdAt', { ascending: false })

          if (error) {
            console.error('Erreur récupération tous devis:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify(quotes || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'POST':
        const quoteData = await req.json()
        console.log('Création devis:', quoteData)

        // Créer le devis
        const { data: newQuote, error: quoteError } = await supabase
          .from('Quote')
          .insert({
            patientId: quoteData.patientId,
            osteopathId: osteopath.id,
            cabinetId: quoteData.cabinetId,
            title: quoteData.title,
            description: quoteData.description,
            amount: quoteData.amount,
            validUntil: quoteData.validUntil,
            status: quoteData.status || 'DRAFT',
            notes: quoteData.notes
          })
          .select()
          .single()

        if (quoteError) {
          console.error('Erreur création devis:', quoteError)
          return new Response(JSON.stringify({ error: quoteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Créer les items du devis si présents
        if (quoteData.items && quoteData.items.length > 0) {
          const itemsToInsert = quoteData.items.map((item: any) => ({
            quoteId: newQuote.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))

          const { error: itemsError } = await supabase
            .from('QuoteItem')
            .insert(itemsToInsert)

          if (itemsError) {
            console.error('Erreur création items devis:', itemsError)
            // On continue malgré l'erreur des items
          }
        }

        // Récupérer le devis complet avec ses items
        const { data: completeQuote, error: fetchError } = await supabase
          .from('Quote')
          .select(`
            *,
            items:QuoteItem(*)
          `)
          .eq('id', newQuote.id)
          .single()

        if (fetchError) {
          console.error('Erreur récupération devis complet:', fetchError)
          return new Response(JSON.stringify(newQuote), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify(completeQuote), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'PUT':
        if (!quoteId || isNaN(Number(quoteId))) {
          return new Response(JSON.stringify({ error: 'ID de devis invalide' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData = await req.json()
        console.log('Mise à jour devis:', quoteId, updateData)

        // Mettre à jour le devis
        const { data: updatedQuote, error: updateError } = await supabase
          .from('Quote')
          .update({
            title: updateData.title,
            description: updateData.description,
            amount: updateData.amount,
            validUntil: updateData.validUntil,
            status: updateData.status,
            notes: updateData.notes
          })
          .eq('id', quoteId)
          .eq('osteopathId', osteopath.id)
          .select()
          .single()

        if (updateError) {
          console.error('Erreur mise à jour devis:', updateError)
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Supprimer les anciens items et créer les nouveaux
        if (updateData.items) {
          await supabase
            .from('QuoteItem')
            .delete()
            .eq('quoteId', quoteId)

          if (updateData.items.length > 0) {
            const itemsToInsert = updateData.items.map((item: any) => ({
              quoteId: Number(quoteId),
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }))

            await supabase
              .from('QuoteItem')
              .insert(itemsToInsert)
          }
        }

        // Récupérer le devis complet mis à jour
        const { data: completeUpdatedQuote, error: fetchUpdatedError } = await supabase
          .from('Quote')
          .select(`
            *,
            items:QuoteItem(*)
          `)
          .eq('id', quoteId)
          .single()

        if (fetchUpdatedError) {
          return new Response(JSON.stringify(updatedQuote), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify(completeUpdatedQuote), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'DELETE':
        if (!quoteId || isNaN(Number(quoteId))) {
          return new Response(JSON.stringify({ error: 'ID de devis invalide' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error: deleteError } = await supabase
          .from('Quote')
          .delete()
          .eq('id', quoteId)
          .eq('osteopathId', osteopath.id)

        if (deleteError) {
          console.error('Erreur suppression devis:', deleteError)
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Erreur quote API:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
