
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  verifyUserAndGetIdentity, 
  verifyCabinetOwnership,
  createErrorResponse,
  createSuccessResponse
} from "../_shared/auth-helpers.ts";

serve(async (req: Request) => {
  // Cette vérification est importante pour les requêtes preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Vérifier l'identité de l'utilisateur et récupérer le client Supabase authentifié
  const { identity, supabaseClient, message } = await verifyUserAndGetIdentity(req);
  
  if (!identity) {
    return createErrorResponse(message || "Authentification requise", 401);
  }
  
  try {
    const url = new URL(req.url);
    const cabinetId = url.searchParams.get("id");
    // Utiliser X-HTTP-Method-Override s'il existe, sinon utiliser la méthode HTTP standard
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    console.log("Méthode demandée:", method);
    console.log("Cabinet ID:", cabinetId);
    
    // Pour les opérations de modification (PUT, PATCH, DELETE), vérifier la propriété du cabinet
    if ((method === "PUT" || method === "PATCH" || method === "DELETE") && cabinetId) {
      const isOwner = await verifyCabinetOwnership(supabaseClient, cabinetId, identity.osteopathId);
      
      if (!isOwner) {
        return createErrorResponse("Accès non autorisé: ce cabinet n'appartient pas à votre compte", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (cabinetId) {
          // Récupérer un cabinet spécifique
          const { data, error } = await supabaseClient
            .from("Cabinet")
            .select("*")
            .eq("id", cabinetId)
            .eq("osteopathId", identity.osteopathId) // Sécurisation: filtrer par osteopathId
            .single();

          if (error) throw error;
          return createSuccessResponse(data);
        } else {
          // Récupérer tous les cabinets de l'ostéopathe connecté
          const { data, error } = await supabaseClient
            .from("Cabinet")
            .select("*")
            .eq("osteopathId", identity.osteopathId); // Sécurisation: filtrer par osteopathId

          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer un nouveau cabinet
        const postData = await req.json();
        
        // SÉCURITÉ: S'assurer que le cabinet est associé à l'ostéopathe connecté
        postData.osteopathId = identity.osteopathId;
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Cabinet")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return createSuccessResponse(insertData, 201);

      case "PUT":
      case "PATCH":
        // Mettre à jour un cabinet existant
        if (!cabinetId) {
          return createErrorResponse("ID cabinet requis pour la mise à jour", 400);
        }
        
        const patchData = await req.json();
        
        // SÉCURITÉ: S'assurer que l'osteopathId ne peut pas être modifié
        patchData.osteopathId = identity.osteopathId;
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Cabinet")
          .update(patchData)
          .eq("id", cabinetId)
          .eq("osteopathId", identity.osteopathId) // Sécurisation: filtrer par osteopathId
          .select();

        if (updateError) throw updateError;
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer un cabinet
        if (!cabinetId) {
          return createErrorResponse("ID cabinet requis pour la suppression", 400);
        }

        const { error: deleteError } = await supabaseClient
          .from("Cabinet")
          .delete()
          .eq("id", cabinetId)
          .eq("osteopathId", identity.osteopathId); // Sécurisation: filtrer par osteopathId

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: cabinetId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
