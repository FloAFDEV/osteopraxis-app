
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  verifyUserAndGetIdentity,
  createErrorResponse,
  createSuccessResponse
} from "../_shared/auth-helpers.ts";

serve(async (req: Request) => {
  // Cette vérification est importante pour les requêtes preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
       headers: {
        ...corsHeaders,
        "Content-Length": "0",
      },
    });
  }

  // Vérifier l'identité de l'utilisateur et récupérer le client Supabase authentifié
  const { identity, supabaseClient, message } = await verifyUserAndGetIdentity(req);
  
  if (!identity) {
    return createErrorResponse(message || "Authentification requise", 401);
  }
  
  try {
    const url = new URL(req.url);
    const profileId = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    // Si on opère sur un profil spécifique, vérifier qu'il appartient à l'utilisateur actuel ou à l'ostéopathe
    if (profileId && method !== "GET") {
      const { data: profile, error: profileError } = await supabaseClient
        .from("ProfessionalProfile")
        .select("userId")
        .eq("id", profileId)
        .maybeSingle();
      
      if (profileError || !profile) {
        return createErrorResponse("Profil professionnel non trouvé", 404);
      }
      
      // Vérifier que le profil appartient à l'utilisateur connecté
      const { data: authData } = await supabaseClient.auth.getUser();
      if (!authData.user || profile.userId !== authData.user.id) {
        return createErrorResponse("Accès non autorisé: ce profil professionnel ne vous appartient pas", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (profileId) {
          // Récupérer un profil professionnel spécifique
          const { data, error } = await supabaseClient
            .from("ProfessionalProfile")
            .select("*")
            .eq("id", profileId)
            .maybeSingle();

          if (error) throw error;
          return createSuccessResponse(data);
        } else if (userId) {
          // Récupérer un profil par userId
          const { data, error } = await supabaseClient
            .from("ProfessionalProfile")
            .select("*")
            .eq("userId", userId)
            .maybeSingle();

          if (error) throw error;
          return createSuccessResponse(data);
        } else {
          // Par défaut, récupérer le profil de l'utilisateur connecté
          const { data: authData } = await supabaseClient.auth.getUser();
          
          if (!authData.user) {
            return createErrorResponse("Utilisateur non authentifié", 401);
          }
          
          const { data, error } = await supabaseClient
            .from("ProfessionalProfile")
            .select("*")
            .eq("userId", authData.user.id)
            .maybeSingle();

          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer un nouveau profil professionnel
        const postData = await req.json();
        
        // Récupérer l'utilisateur actuel
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
          return createErrorResponse("Utilisateur non authentifié", 401);
        }
        
        // Vérifier si un profil existe déjà pour cet utilisateur
        const { data: existingProfile, error: existingError } = await supabaseClient
          .from("ProfessionalProfile")
          .select("id")
          .eq("userId", user.id)
          .maybeSingle();
          
        if (existingProfile) {
          return createErrorResponse("Un profil professionnel existe déjà pour cet utilisateur", 409);
        }
        
        // Créer le profil en s'assurant que userId est celui de l'utilisateur connecté
        const { data: insertData, error: insertError } = await supabaseClient
          .from("ProfessionalProfile")
          .insert({ 
            ...postData,
            userId: user.id // S'assurer que le profil est associé à l'utilisateur connecté
          })
          .select();

        if (insertError) throw insertError;
        return createSuccessResponse(insertData, 201);

      case "PUT":
      case "PATCH":
        // Mettre à jour un profil professionnel existant
        if (!profileId) {
          return createErrorResponse("ID de profil requis pour la mise à jour", 400);
        }
        
        const patchData = await req.json();
        
        // Empêcher la modification du userId
        const { data: authData } = await supabaseClient.auth.getUser();
        if (authData.user) {
          patchData.userId = authData.user.id; // S'assurer que le userId reste celui de l'utilisateur connecté
        }
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("ProfessionalProfile")
          .update(patchData)
          .eq("id", profileId)
          .select();

        if (updateError) throw updateError;
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer un profil professionnel
        if (!profileId) {
          return createErrorResponse("ID de profil requis pour la suppression", 400);
        }

        const { error: deleteError } = await supabaseClient
          .from("ProfessionalProfile")
          .delete()
          .eq("id", profileId);

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: profileId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
