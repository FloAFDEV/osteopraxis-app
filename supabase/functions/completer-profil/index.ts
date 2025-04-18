
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
    console.log("Authorization header présent:", !!authHeader)
    
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
    console.log("Récupération de l'utilisateur...")
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error("Erreur de récupération de l'utilisateur:", userError)
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
    console.log("Récupération des données du corps...")
    let profileData
    try {
      const requestData = await req.json()
      profileData = requestData.profileData
      
      // Si aucun nom n'est fourni, utiliser l'email comme valeur par défaut
      if (profileData && !profileData.name && user.email) {
        profileData.name = user.email.split('@')[0]
      }
      
      console.log("Données reçues:", profileData)
    } catch (jsonError) {
      console.error("Erreur lors de la lecture du corps de la requête:", jsonError)
      return new Response(
        JSON.stringify({ error: 'Erreur de lecture du corps de la requête', details: String(jsonError) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    if (!profileData) {
      console.error("Pas de données de profil fournies")
      return new Response(
        JSON.stringify({ error: 'Pas de données de profil fournies' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log("Tentative de création/récupération de profil pour l'utilisateur:", user.id)
    
    // Accéder à la base de données avec des privilèges élevés
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    )

    // Vérifier si un profil existe déjà pour cet utilisateur
    console.log("Recherche d'un profil existant...")
    const { data: existingProfile, error: findError } = await adminClient
      .from('ProfessionalProfile')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle()
      
    if (findError) {
      console.error("Erreur lors de la recherche d'un profil existant:", findError)
      
      // Vérifier si l'erreur est liée aux permissions
      if (findError.code === "42501") {
        console.error("Erreur de permission. Vérification des paramètres du service_role_key.")
        
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
      throw findError
    }

    let result
    
    if (existingProfile) {
      // Mettre à jour le profil existant
      console.log("Mise à jour du profil existant:", existingProfile.id)
      
      // Ne pas écraser les champs existants si vides
      const updatedData = { ...profileData }
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === null && existingProfile[key]) {
          updatedData[key] = existingProfile[key]
        }
      })
      
      const { data, error: updateError } = await adminClient
        .from('ProfessionalProfile')
        .update({
          ...updatedData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single()
        
      if (updateError) {
        console.error("Erreur lors de la mise à jour du profil:", updateError)
        throw updateError
      }
      
      result = { profile: data, operation: 'mise à jour', success: true }
    } else {
      // Créer un nouveau profil
      console.log("Création d'un nouveau profil avec le service_role")
      const now = new Date().toISOString()
      
      // S'assurer que nous avons les données minimales requises
      const profileToCreate = {
        name: profileData.name || user.email?.split('@')[0] || "Professionnel",
        title: profileData.title || "Ostéopathe D.O.",
        profession_type: profileData.profession_type || "osteopathe",
        adeli_number: profileData.adeli_number || null,
        siret: profileData.siret || null,
        ape_code: profileData.ape_code || "8690F",
        userId: user.id,
        createdAt: now,
        updatedAt: now
      }
      
      console.log("Tentative d'insertion avec:", profileToCreate)
      
      const { data, error: insertError } = await adminClient
        .from('ProfessionalProfile')
        .insert(profileToCreate)
        .select()
        .single()
        
      if (insertError) {
        console.error("Erreur lors de l'insertion du profil:", insertError)
        throw insertError
      }
        
      result = { profile: data, operation: 'création', success: true }
    }

    // Mettre à jour le profil utilisateur avec l'ID du profil si nécessaire
    if (result.profile && result.profile.id) {
      console.log("Mise à jour du profil utilisateur avec l'ID du profil:", result.profile.id)
      const { error: userUpdateError } = await adminClient
        .from('User')
        .update({ professionalProfileId: result.profile.id })
        .eq('id', user.id)
        
      if (userUpdateError) {
        console.error("Erreur lors de la mise à jour du profil utilisateur:", userUpdateError)
        result.userUpdateError = userUpdateError.message
      } else {
        result.userUpdated = true
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error("Erreur dans la fonction edge:", error)
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
