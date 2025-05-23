
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
    const osteopathId = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    // Pour les opérations de modification, vérifier que l'utilisateur modifie son propre profil d'ostéopathe
    if ((method === "PUT" || method === "PATCH" || method === "DELETE") && osteopathId) {
      // Vérifier que l'ostéopathe est bien celui associé à l'utilisateur connecté
      if (parseInt(osteopathId) !== identity.osteopathId) {
        return createErrorResponse("Accès non autorisé: vous ne pouvez modifier que votre propre profil d'ostéopathe", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (osteopathId) {
          // Récupérer un ostéopathe spécifique par ID
          const { data, error } = await supabaseClient
            .from("Osteopath")
            .select("*")
            .eq("id", osteopathId)
            .maybeSingle();

          if (error) throw error;
          return createSuccessResponse(data);
        } else if (userId) {
          // Récupérer un ostéopathe par userId (UUID)
          const { data, error } = await supabaseClient
            .from("Osteopath")
            .select("*")
            .eq("userId", userId)
            .maybeSingle();

          if (error) {
            // Si aucun résultat, rechercher via la table User
            const { data: userData, error: userError } = await supabaseClient
              .from("User")
              .select("osteopathId")
              .eq("auth_id", userId)
              .maybeSingle();

            if (userError || !userData || !userData.osteopathId) {
              return createErrorResponse("Ostéopathe non trouvé", 404);
            }

            // Récupérer les données de l'ostéopathe avec l'ID trouvé
            const { data: osteoData, error: osteoError } = await supabaseClient
              .from("Osteopath")
              .select("*")
              .eq("id", userData.osteopathId)
              .maybeSingle();

            if (osteoError) throw osteoError;
            return createSuccessResponse(osteoData);
          }

          return createSuccessResponse(data);
        } else {
          // Par défaut, récupérer l'ostéopathe de l'utilisateur connecté
          if (!identity.osteopathId) {
            return createErrorResponse("Aucun profil d'ostéopathe n'est associé à votre compte", 404);
          }
          
          const { data, error } = await supabaseClient
            .from("Osteopath")
            .select("*")
            .eq("id", identity.osteopathId)
            .maybeSingle();
            
          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer un nouvel ostéopathe
        const postData = await req.json();
        
        // Récupérer l'utilisateur actuel
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
          return createErrorResponse("Utilisateur non authentifié", 401);
        }
        
        // Vérifier si un ostéopathe existe déjà pour cet utilisateur
        if (identity.osteopathId) {
          return createErrorResponse("Un profil d'ostéopathe existe déjà pour votre compte", 409);
        }
        
        // Vérifier via la table Osteopath directement
        const { data: existingOsteopath, error: existingError } = await supabaseClient
          .from("Osteopath")
          .select("id")
          .eq("userId", user.id)
          .maybeSingle();
          
        if (existingOsteopath) {
          return createErrorResponse("Un ostéopathe existe déjà pour cet utilisateur", 409);
        }
        
        // Créer l'ostéopathe en s'assurant que userId est celui de l'utilisateur connecté
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Osteopath")
          .insert({ 
            ...postData,
            userId: user.id // S'assurer que l'ostéopathe est associé à l'utilisateur connecté
          })
          .select();

        if (insertError) throw insertError;
        
        // Mettre à jour la table User avec la référence à l'ostéopathe créé
        if (insertData && insertData.length > 0) {
          const newOsteopathId = insertData[0].id;
          
          await supabaseClient
            .from("User")
            .update({ osteopathId: newOsteopathId })
            .eq("auth_id", user.id);
        }
        
        return createSuccessResponse(insertData, 201);

      case "PUT":
      case "PATCH":
        // Mettre à jour un ostéopathe existant
        if (!osteopathId) {
          return createErrorResponse("ID d'ostéopathe requis pour la mise à jour", 400);
        }
        
        const patchData = await req.json();
        
        // Empêcher la modification du userId
        const { data: authData } = await supabaseClient.auth.getUser();
        if (authData.user) {
          patchData.userId = authData.user.id; // S'assurer que le userId reste celui de l'utilisateur connecté
        }
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Osteopath")
          .update(patchData)
          .eq("id", osteopathId)
          .select();

        if (updateError) throw updateError;
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer un ostéopathe
        if (!osteopathId) {
          return createErrorResponse("ID d'ostéopathe requis pour la suppression", 400);
        }

        // D'abord, mettre à jour la table User pour supprimer la référence à l'ostéopathe
        const { data: { user: currentUser } } = await supabaseClient.auth.getUser();
        if (currentUser) {
          await supabaseClient
            .from("User")
            .update({ osteopathId: null })
            .eq("auth_id", currentUser.id);
        }
        
        // Ensuite, supprimer l'ostéopathe
        const { error: deleteError } = await supabaseClient
          .from("Osteopath")
          .delete()
          .eq("id", osteopathId);

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: osteopathId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
