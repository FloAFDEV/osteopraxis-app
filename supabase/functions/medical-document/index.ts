
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
    const documentId = url.searchParams.get("id");
    const patientId = url.searchParams.get("patientId");
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    // Vérifier la propriété du patient si fourni
    if (patientId) {
      const isPatientOwner = await verifyPatientOwnership(supabaseClient, patientId, identity.osteopathId);
      if (!isPatientOwner) {
        return createErrorResponse("Accès non autorisé: ce patient n'appartient pas à votre compte", 403);
      }
    }

    // Pour les opérations de modification sur un document existant, vérifier la propriété
    if ((method === "PUT" || method === "PATCH" || method === "DELETE") && documentId) {
      // Vérifier que le document appartient à un patient de cet ostéopathe
      const { data: document, error: documentError } = await supabaseClient
        .from("MedicalDocument")
        .select("patientId")
        .eq("id", documentId)
        .maybeSingle();
      
      if (documentError || !document) {
        return createErrorResponse("Document médical non trouvé", 404);
      }
      
      const isPatientOwner = await verifyPatientOwnership(
        supabaseClient,
        document.patientId,
        identity.osteopathId
      );
      
      if (!isPatientOwner) {
        return createErrorResponse("Accès non autorisé: ce document concerne un patient qui n'appartient pas à votre compte", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (documentId) {
          // Récupérer un document spécifique
          const { data, error } = await supabaseClient
            .from("MedicalDocument")
            .select("*")
            .eq("id", documentId)
            .maybeSingle();

          if (error) throw error;
          
          // Vérifier que le document appartient à un patient de cet ostéopathe
          if (data) {
            const isPatientOwner = await verifyPatientOwnership(
              supabaseClient,
              data.patientId,
              identity.osteopathId
            );
            
            if (!isPatientOwner) {
              return createErrorResponse("Accès non autorisé: ce document concerne un patient qui n'appartient pas à votre compte", 403);
            }
          }
          
          return createSuccessResponse(data);
        } else if (patientId) {
          // Récupérer les documents d'un patient spécifique
          const { data, error } = await supabaseClient
            .from("MedicalDocument")
            .select("*")
            .eq("patientId", patientId);

          if (error) throw error;
          return createSuccessResponse(data);
        } else {
          // Récupérer tous les documents des patients de l'ostéopathe
          // D'abord, récupérer tous les patients de l'ostéopathe
          const { data: patients, error: patientsError } = await supabaseClient
            .from("Patient")
            .select("id")
            .eq("osteopathId", identity.osteopathId);
          
          if (patientsError) throw patientsError;
          
          if (!patients || patients.length === 0) {
            return createSuccessResponse([]);
          }
          
          // Ensuite, récupérer tous les documents pour ces patients
          const patientIds = patients.map(p => p.id);
          const { data, error } = await supabaseClient
            .from("MedicalDocument")
            .select("*")
            .in("patientId", patientIds);
            
          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer un nouveau document médical
        const postData = await req.json();
        
        // Vérifier que le patient appartient bien à l'ostéopathe
        const isPostPatientOwner = await verifyPatientOwnership(
          supabaseClient,
          postData.patientId,
          identity.osteopathId
        );
        
        if (!isPostPatientOwner) {
          return createErrorResponse("Accès non autorisé: ce patient n'appartient pas à votre compte", 403);
        }
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from("MedicalDocument")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return createSuccessResponse(insertData, 201);

      case "PUT":
      case "PATCH":
        // Mettre à jour un document existant
        if (!documentId) {
          return createErrorResponse("ID document requis pour la mise à jour", 400);
        }
        
        const patchData = await req.json();
        
        // Vérifier si la mise à jour modifie le patientId
        if (patchData.patientId) {
          const isNewPatientOwner = await verifyPatientOwnership(
            supabaseClient,
            patchData.patientId,
            identity.osteopathId
          );
          
          if (!isNewPatientOwner) {
            return createErrorResponse("Accès non autorisé: le nouveau patient n'appartient pas à votre compte", 403);
          }
        }
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("MedicalDocument")
          .update(patchData)
          .eq("id", documentId)
          .select();

        if (updateError) throw updateError;
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer un document
        if (!documentId) {
          return createErrorResponse("ID document requis pour la suppression", 400);
        }

        const { error: deleteError } = await supabaseClient
          .from("MedicalDocument")
          .delete()
          .eq("id", documentId);

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: documentId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
