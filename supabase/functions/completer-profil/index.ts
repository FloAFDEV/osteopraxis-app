
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Gestion de la requête OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Récupérer le token JWT de l'en-tête Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Aucun token d\'authentification fourni' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Créer un client Supabase avec le token auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Récupérer la session utilisateur
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Erreur de récupération de l\'utilisateur', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Récupérer les données envoyées dans le corps de la requête
    const { osteopathData } = await req.json()
    
    console.log("Tentative de création d'ostéopathe pour l'utilisateur:", user.id);

    // Vérifier si un ostéopathe existe déjà pour cet utilisateur
    const { data: existingOsteopath, error: findError } = await supabaseClient
      .from('Osteopath')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Erreur lors de la recherche d'un ostéopathe existant:", findError);
    }

    let result;
    
    if (existingOsteopath) {
      // Mettre à jour l'ostéopathe existant
      console.log("Mise à jour de l'ostéopathe existant:", existingOsteopath.id);
      const { data, error: updateError } = await supabaseClient
        .from('Osteopath')
        .update({
          ...osteopathData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingOsteopath.id)
        .select()
        .single();
        
      if (updateError) {
        throw updateError;
      }
      
      result = { osteopath: data, operation: 'mise à jour' };
    } else {
      // Créer un nouvel ostéopathe
      console.log("Création d'un nouvel ostéopathe");
      const now = new Date().toISOString();
      const { data, error: insertError } = await supabaseClient
        .from('Osteopath')
        .insert({
          ...osteopathData,
          userId: user.id,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      result = { osteopath: data, operation: 'création' };
    }

    // Mettre à jour le profil utilisateur avec l'ID de l'ostéopathe si nécessaire
    if (result.osteopath && result.osteopath.id) {
      const { error: userUpdateError } = await supabaseClient
        .from('User')
        .update({ osteopathId: result.osteopath.id })
        .eq('id', user.id);
        
      if (userUpdateError) {
        console.error("Erreur lors de la mise à jour du profil utilisateur:", userUpdateError);
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error("Erreur dans la fonction edge:", error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
