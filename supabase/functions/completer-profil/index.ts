
import { corsHeaders } from '../_shared/cors.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // Pré-flight OPTIONS systématique pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Récupérer le token JWT de l'en-tête Authorization
  const authHeader = req.headers.get('Authorization')
  console.log("Authorization header présent:", !!authHeader);
  
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Aucun token d\'authentification fourni' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Vérifier si les variables d'environnement sont correctement configurées
    if (!supabaseUrl || !supabaseKey) {
      console.error("Variables d'environnement manquantes:", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Configuration des variables d\'environnement incomplète', 
          details: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Créer un client Supabase avec le token auth
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
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

    // Support both PATCH and POST with X-HTTP-Method-Override
    const method = req.headers.get('X-HTTP-Method-Override') || req.method;
    console.log("Méthode effective:", method);
    
    let osteopathData;
    try {
      const requestData = await req.json();
      osteopathData = requestData.osteopathData;
      
      if (osteopathData && !osteopathData.name && user.email) {
        osteopathData.name = user.email.split('@')[0];
      }
      
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
    
    console.log("Tentative de création/récupération d'ostéopathe pour l'utilisateur:", user.id);
    
    // Accéder à la base de données avec des privilèges élevés
    const adminClient = createClient(
      supabaseUrl,
      supabaseKey,
      { auth: { persistSession: false } }
    );

    // Vérifier si un ostéopathe existe déjà pour cet utilisateur
    console.log("Recherche d'un ostéopathe existant...");
    const { data: existingOsteopath, error: findError } = await adminClient
      .from('Osteopath')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Erreur lors de la recherche d'un ostéopathe existant:", findError);
      
      // Vérifier si l'erreur est liée aux permissions
      if (findError.code === "42501") {
        console.error("Erreur de permission. Vérification des paramètres du service_role_key.");
        
        return new Response(
          JSON.stringify({ 
            error: 'Erreur de permission lors de l\'accès à la base de données',
            details: findError,
            suggestion: 'Vérifiez que le SERVICE_ROLE_KEY est correctement configuré'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      // Retourner l'erreur au lieu de continuer
      throw findError;
    }

    let result;
    
    if (existingOsteopath) {
      // Mettre à jour l'ostéopathe existant
      console.log("Mise à jour de l'ostéopathe existant:", existingOsteopath.id);
      
      // Ne pas écraser les champs existants si vides
      const updatedData = { ...osteopathData };
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === null && existingOsteopath[key]) {
          updatedData[key] = existingOsteopath[key];
        }
      });
      
      const { data, error: updateError } = await adminClient
        .from('Osteopath')
        .update({
          ...updatedData,
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
      console.log("Création d'un nouvel ostéopathe avec le service_role");
      const now = new Date().toISOString();
      
      // S'assurer que nous avons les données minimales requises
      const osteopathToCreate = {
        name: osteopathData.name || user.email?.split('@')[0] || "Ostéopathe",
        professional_title: osteopathData.professional_title || "Ostéopathe D.O.",
        adeli_number: osteopathData.adeli_number || null,
        siret: osteopathData.siret || null,
        ape_code: osteopathData.ape_code || "8690F",
        userId: user.id,
        createdAt: now,
        updatedAt: now
      };
      
      console.log("Tentative d'insertion avec:", osteopathToCreate);
      
      const { data, error: insertError } = await adminClient
        .from('Osteopath')
        .insert(osteopathToCreate)
        .select()
        .single();
        
      if (insertError) {
        console.error("Erreur lors de l'insertion de l'ostéopathe:", insertError);
        throw insertError;
      }
        
      result = { osteopath: data, operation: 'création', success: true };
    }

    // Mettre à jour le profil utilisateur avec l'ID de l'ostéopathe si nécessaire
    if (result.osteopath && result.osteopath.id) {
      console.log("Mise à jour du profil utilisateur avec l'ID de l'ostéopathe:", result.osteopath.id);
      const { error: userUpdateError } = await adminClient
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
});
