
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

  // Créer un client Supabase standard pour l'authentification
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

  try {
    // Support both PATCH and POST with X-HTTP-Method-Override
    const method = req.headers.get('X-HTTP-Method-Override') || req.method;
    console.log("Méthode effective:", method);
    console.log("User ID trouvé:", user.id);
    
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
    
    // Accéder à la base de données avec des privilèges élevés (service_role)
    // Ici nous créons un client avec la SERVICE_ROLE_KEY qui contourne la RLS
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false
        },
        // Pas besoin d'en-têtes d'autorisation car service_role ignore l'authentification
        db: {
          schema: 'public'
        }
      }
    );

    // Vérification que la clé service_role est disponible
    if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      console.error("ERREUR CRITIQUE: La clé SUPABASE_SERVICE_ROLE_KEY n'est pas définie");
      return new Response(
        JSON.stringify({ 
          error: 'Configuration du serveur incorrecte - clé service_role manquante',
          suggestion: 'Contactez l\'administrateur pour configurer la clé SERVICE_ROLE_KEY'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Vérifier si un ostéopathe existe déjà pour cet utilisateur
    console.log("Recherche d'un ostéopathe existant avec le client admin...");
    let { data: existingOsteopath, error: findError } = await adminClient
      .from('Osteopath')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle();
      
    // Si erreur lors de la recherche, afficher des informations de débogage
    if (findError) {
      console.error("Erreur lors de la recherche d'un ostéopathe existant:", findError);

      // Test d'accès à la table pour vérifier les permissions
      console.log("Test d'accès à la base de données avec le client admin...");
      const { data: testData, error: testError } = await adminClient
        .from('Osteopath')
        .select('count(*)')
        .limit(1);
        
      if (testError) {
        console.error("Erreur de test d'accès à la table Osteopath:", testError);
        return new Response(
          JSON.stringify({ 
            error: 'Erreur d\'accès à la base de données avec le service_role',
            details: testError,
            suggestion: 'Vérifiez la configuration de SUPABASE_SERVICE_ROLE_KEY et les permissions'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      } else {
        console.log("Test d'accès réussi, mais erreur lors de la recherche spécifique:", findError);
      }
      
      // Retourner l'erreur
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la recherche d\'un ostéopathe existant',
          details: findError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Log des informations pour debugging
    if (existingOsteopath) {
      console.log("Ostéopathe existant trouvé:", existingOsteopath.id);
    } else {
      console.log("Aucun ostéopathe trouvé, création nécessaire");
    }

    let result;
    
    if (existingOsteopath) {
      // Vérifier que l'utilisateur ne modifie que son propre ostéopathe
      if (existingOsteopath.userId !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Vous ne pouvez pas modifier les données d\'un autre utilisateur' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      
      // Mettre à jour l'ostéopathe existant
      console.log("Mise à jour de l'ostéopathe existant:", existingOsteopath.id);
      
      // Ne pas écraser les champs existants si vides
      const updatedData = { ...osteopathData };
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === null && existingOsteopath[key]) {
          updatedData[key] = existingOsteopath[key];
        }
      });
      
      const { data: updatedOsteopath, error: updateError } = await adminClient
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
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la mise à jour', details: updateError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      result = { osteopath: updatedOsteopath, operation: 'mise à jour', success: true };
    } else {
      // Créer un nouvel ostéopathe
      console.log("Création d'un nouvel ostéopathe avec le service_role");
      const now = new Date().toISOString();
      
      // S'assurer que nous avons les données minimales requises
      // et s'assurer que userId correspond à l'utilisateur authentifié
      const osteopathToCreate = {
        name: osteopathData.name || user.email?.split('@')[0] || "Ostéopathe",
        professional_title: osteopathData.professional_title || "Ostéopathe D.O.",
        adeli_number: osteopathData.adeli_number || null,
        siret: osteopathData.siret || null,
        ape_code: osteopathData.ape_code || "8690F",
        userId: user.id, // S'assurer que l'userId est celui de l'utilisateur authentifié
        createdAt: now,
        updatedAt: now
      };
      
      console.log("Tentative d'insertion avec:", osteopathToCreate);
      
      const { data: newOsteopath, error: insertError } = await adminClient
        .from('Osteopath')
        .insert(osteopathToCreate)
        .select()
        .single();
        
      if (insertError) {
        console.error("Erreur lors de l'insertion de l'ostéopathe:", insertError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création', details: insertError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
        
      result = { osteopath: newOsteopath, operation: 'création', success: true };
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
