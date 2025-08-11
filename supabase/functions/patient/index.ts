
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  verifyUserAndGetIdentity, 
  verifyPatientOwnership, 
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
    const patientId = url.searchParams.get("id");

    // Rate limiting to protect the endpoint (15 min window)
    try {
      const { data: allowed, error: rlError } = await supabaseClient.rpc('check_rate_limit', {
        p_user_id: identity.authId,
        p_endpoint: 'edge/patient',
        p_max_requests: 300,
        p_window_minutes: 15
      });
      if (!rlError && allowed === false) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes, réessayez plus tard' }),
          { status: 429, headers: { ...corsHeaders, 'Retry-After': '900', 'Content-Type': 'application/json' } }
        );
      }
    } catch (_) {
      // En cas d'erreur de quota, ne pas bloquer la requête
    }
    
    // Utiliser X-HTTP-Method-Override s'il existe, sinon utiliser la méthode HTTP standard
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    console.log("Méthode demandée:", method);
    console.log("Patient ID:", patientId);
    
    // Pour les opérations de modification (PUT, PATCH, DELETE), vérifier la propriété du patient
    if ((method === "PUT" || method === "PATCH" || method === "DELETE") && patientId) {
      const isOwner = await verifyPatientOwnership(supabaseClient, patientId, identity.osteopathId);
      
      if (!isOwner) {
        return createErrorResponse("Accès non autorisé: ce patient n'appartient pas à votre compte", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (patientId) {
          // Vérifier l'accès (propriété directe ou accès étendu via cabinet/remplacement)
          const hasAccess = await verifyPatientOwnership(supabaseClient, patientId, identity.osteopathId);
          if (!hasAccess) {
            return createErrorResponse("Accès non autorisé à ce patient", 403);
          }

          const { data, error } = await supabaseClient
            .from("Patient")
            .select("*")
            .eq("id", patientId)
            .maybeSingle();

          if (error) throw error;
          return createSuccessResponse(data);
        } else {
          // Récupérer tous les patients accessibles à l'ostéopathe (directs + cabinets associés)
          const { data: cabinetsData, error: cabinetsError } = await supabaseClient
            .rpc('get_osteopath_cabinets', { osteopath_auth_id: identity.authId });
          if (cabinetsError) throw cabinetsError;
          const cabinetIds: number[] = (cabinetsData || []).map((r: any) => r.cabinet_id);

          let query = supabaseClient.from("Patient").select("*");
          if (cabinetIds.length > 0) {
            // OR: patients dont l'ostéo courant est propriétaire OU dont le cabinet est associé
            query = query.or(`osteopathId.eq.${identity.osteopathId},cabinetId.in.(${cabinetIds.join(',')})`);
          } else {
            query = query.eq("osteopathId", identity.osteopathId);
          }
          const { data, error } = await query;
          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer un nouveau patient
        const postData = await req.json();
        
        // Assurer que les valeurs numériques sont correctement formatées
        if (postData.height) postData.height = Number(postData.height);
        if (postData.weight) postData.weight = Number(postData.weight);
        if (postData.bmi) postData.bmi = Number(postData.bmi);
        if (postData.weight_at_birth) postData.weight_at_birth = Number(postData.weight_at_birth);
        if (postData.height_at_birth) postData.height_at_birth = Number(postData.height_at_birth);
        if (postData.head_circumference) postData.head_circumference = Number(postData.head_circumference);
        
        // SÉCURITÉ: S'assurer que le patient est associé à l'ostéopathe connecté
        postData.osteopathId = identity.osteopathId;
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Patient")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return createSuccessResponse(insertData, 201);

      case "PUT":
      case "PATCH":
        // Mettre à jour un patient existant
        if (!patientId) {
          return createErrorResponse("ID patient requis pour la mise à jour", 400);
        }
        
        const patchData = await req.json();
        console.log("Données de mise à jour:", patchData);
        
        // SÉCURITÉ: S'assurer que l'osteopathId ne peut pas être modifié
        patchData.osteopathId = identity.osteopathId;
        
        // Assurer que les valeurs numériques sont correctement formatées
        if (patchData.height !== undefined) patchData.height = patchData.height ? Number(patchData.height) || null : null;
        if (patchData.weight !== undefined) patchData.weight = patchData.weight ? Number(patchData.weight) || null : null;
        if (patchData.bmi !== undefined) patchData.bmi = patchData.bmi ? Number(patchData.bmi) || null : null;
        if (patchData.weight_at_birth !== undefined) patchData.weight_at_birth = patchData.weight_at_birth ? Number(patchData.weight_at_birth) || null : null;
        if (patchData.height_at_birth !== undefined) patchData.height_at_birth = patchData.height_at_birth ? Number(patchData.height_at_birth) || null : null;
        if (patchData.head_circumference !== undefined) patchData.head_circumference = patchData.head_circumference ? Number(patchData.head_circumference) || null : null;
        
        console.log("Données formatées pour mise à jour:", patchData);
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Patient")
          .update(patchData)
          .eq("id", patientId)
          .eq("osteopathId", identity.osteopathId) // Sécurisation: filtrer par osteopathId
          .select();

        if (updateError) {
          console.error("Erreur de mise à jour:", updateError);
          throw updateError;
        }
        
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer un patient
        if (!patientId) {
          return createErrorResponse("ID patient requis pour la suppression", 400);
        }

        const { error: deleteError } = await supabaseClient
          .from("Patient")
          .delete()
          .eq("id", patientId)
          .eq("osteopathId", identity.osteopathId); // Sécurisation: filtrer par osteopathId

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: patientId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
