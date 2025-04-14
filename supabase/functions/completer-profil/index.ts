
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
    console.log("Authorization header présent:", !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Aucun token d\'authentification fourni' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Créer un client Supabase avec le token auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Récupérer la session utilisateur
    console.log("Récupération de l'utilisateur...");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error("Erreur de récupération de l'utilisateur:", userError);
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de récupération de l\'utilisateur', 
          details: userError,
          auth: authHeader ? "Token présent" : "Pas de token"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Récupérer les données envoyées dans le corps de la requête
    console.log("Récupération des données du corps...");
    let osteopathData;
    try {
      const requestData = await req.json();
      osteopathData = requestData.osteopathData;
      console.log("Données reçues:", osteopathData);
    } catch (jsonError) {
      console.error("Erreur lors de la lecture du corps de la requête:", jsonError);
      return new Response(
        JSON.stringify({ error: 'Erreur de lecture du corps de la requête', details: String(jsonError) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    if (!osteopathData) {
      console.error("Pas de données d'ostéopathe fournies");
      return new Response(
        JSON.stringify({ error: 'Pas de données d\'ostéopathe fournies' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log("Tentative de création d'ostéopathe pour l'utilisateur:", user.id);

    // Vérifier si un ostéopathe existe déjà pour cet utilisateur
    console.log("Recherche d'un ostéopathe existant...");
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
        console.error("Erreur lors de la mise à jour de l'ostéopathe:", updateError);
        throw updateError;
      }
      
      result = { osteopath: data, operation: 'mise à jour', success: true };
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
        console.error("Erreur lors de l'insertion de l'ostéopathe:", insertError);
        
        // Tenter une insertion avec les permissions du service_role
        console.log("Tentative d'utiliser service_role pour l'insertion");
        const adminClient = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          { auth: { persistSession: false } }
        );
        
        const { data: adminData, error: adminError } = await adminClient
          .from('Osteopath')
          .insert({
            ...osteopathData,
            userId: user.id,
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
          
        if (adminError) {
          console.error("Erreur avec service_role:", adminError);
          throw adminError;
        }
        
        result = { osteopath: adminData, operation: 'création (admin)', success: true };
      } else {
        result = { osteopath: data, operation: 'création', success: true };
      }
    }

    // Mettre à jour le profil utilisateur avec l'ID de l'ostéopathe si nécessaire
    if (result.osteopath && result.osteopath.id) {
      console.log("Mise à jour du profil utilisateur avec l'ID de l'ostéopathe:", result.osteopath.id);
      const { error: userUpdateError } = await supabaseClient
        .from('User')
        .update({ osteopathId: result.osteopath.id })
        .eq('id', user.id);
        
      if (userUpdateError) {
        console.error("Erreur lors de la mise à jour du profil utilisateur:", userUpdateError);
        result.userUpdateError = userUpdateError.message;
      } else {
        result.userUpdated = true;
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error("Erreur dans la fonction edge:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur serveur', 
        details: error.message || String(error),
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
