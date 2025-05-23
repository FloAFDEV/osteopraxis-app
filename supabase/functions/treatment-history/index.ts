
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  verifyUserAndGetIdentity,
  verifyAppointmentOwnership,
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
    const historyId = url.searchParams.get("id");
    const consultationId = url.searchParams.get("consultationId");
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    // Vérifier la propriété de la consultation si fournie
    if (consultationId) {
      // D'abord vérifier que la consultation existe et récupérer son patientId
      const { data: consultation, error: consultationError } = await supabaseClient
        .from("Consultation")
        .select("patientId")
        .eq("id", consultationId)
        .maybeSingle();
      
      if (consultationError || !consultation) {
        return createErrorResponse("Consultation non trouvée", 404);
      }
      
      // Ensuite vérifier que le patient appartient à cet ostéopathe
      const isPatientOwner = await verifyPatientOwnership(
        supabaseClient, 
        consultation.patientId, 
        identity.osteopathId
      );
      
      if (!isPatientOwner) {
        return createErrorResponse("Accès non autorisé: cette consultation concerne un patient qui n'appartient pas à votre compte", 403);
      }
    }

    // Pour les opérations de modification sur un historique existant, vérifier la propriété
    if ((method === "PUT" || method === "PATCH" || method === "DELETE") && historyId) {
      // Récupérer d'abord l'historique pour obtenir le consultationId
      const { data: history, error: historyError } = await supabaseClient
        .from("TreatmentHistory")
        .select("consultationId")
        .eq("id", historyId)
        .maybeSingle();
      
      if (historyError || !history) {
        return createErrorResponse("Historique de traitement non trouvé", 404);
      }
      
      // Puis récupérer la consultation pour obtenir le patientId
      const { data: consultation, error: consultationError } = await supabaseClient
        .from("Consultation")
        .select("patientId")
        .eq("id", history.consultationId)
        .maybeSingle();
      
      if (consultationError || !consultation) {
        return createErrorResponse("Consultation associée non trouvée", 404);
      }
      
      // Vérifier que le patient appartient à cet ostéopathe
      const isPatientOwner = await verifyPatientOwnership(
        supabaseClient,
        consultation.patientId,
        identity.osteopathId
      );
      
      if (!isPatientOwner) {
        return createErrorResponse("Accès non autorisé: cet historique concerne un patient qui n'appartient pas à votre compte", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (historyId) {
          // Récupérer un historique spécifique
          const { data, error } = await supabaseClient
            .from("TreatmentHistory")
            .select("*")
            .eq("id", historyId)
            .maybeSingle();

          if (error) throw error;
          
          // Consulter la consultation associée pour vérifier la propriété
          if (data) {
            const { data: consultation, error: consultationError } = await supabaseClient
              .from("Consultation")
              .select("patientId")
              .eq("id", data.consultationId)
              .maybeSingle();
              
            if (!consultationError && consultation) {
              const isPatientOwner = await verifyPatientOwnership(
                supabaseClient,
                consultation.patientId,
                identity.osteopathId
              );
              
              if (!isPatientOwner) {
                return createErrorResponse("Accès non autorisé: cet historique concerne un patient qui n'appartient pas à votre compte", 403);
              }
            }
          }
          
          return createSuccessResponse(data);
        } else if (consultationId) {
          // Récupérer l'historique de traitement d'une consultation
          const { data, error } = await supabaseClient
            .from("TreatmentHistory")
            .select("*")
            .eq("consultationId", consultationId);

          if (error) throw error;
          return createSuccessResponse(data);
        } else {
          // Récupérer tout l'historique des traitements pour les patients de cet ostéopathe
          // C'est une requête complexe qui nécessite plusieurs jointures
          
          // D'abord, récupérer tous les patients de l'ostéopathe
          const { data: patients, error: patientsError } = await supabaseClient
            .from("Patient")
            .select("id")
            .eq("osteopathId", identity.osteopathId);
          
          if (patientsError) throw patientsError;
          
          if (!patients || patients.length === 0) {
            return createSuccessResponse([]);
          }
          
          // Ensuite, récupérer toutes les consultations pour ces patients
          const patientIds = patients.map(p => p.id);
          const { data: consultations, error: consultationsError } = await supabaseClient
            .from("Consultation")
            .select("id")
            .in("patientId", patientIds);
            
          if (consultationsError) throw consultationsError;
          
          if (!consultations || consultations.length === 0) {
            return createSuccessResponse([]);
          }
          
          // Enfin, récupérer tout l'historique pour ces consultations
          const consultationIds = consultations.map(c => c.id);
          const { data, error } = await supabaseClient
            .from("TreatmentHistory")
            .select("*")
            .in("consultationId", consultationIds);
            
          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer un nouvel historique de traitement
        const postData = await req.json();
        
        // Vérifier que la consultation associée appartient à un patient de cet ostéopathe
        const { data: postConsultation, error: postConsultationError } = await supabaseClient
          .from("Consultation")
          .select("patientId")
          .eq("id", postData.consultationId)
          .maybeSingle();
          
        if (postConsultationError || !postConsultation) {
          return createErrorResponse("Consultation associée non trouvée", 404);
        }
        
        const isPostPatientOwner = await verifyPatientOwnership(
          supabaseClient,
          postConsultation.patientId,
          identity.osteopathId
        );
        
        if (!isPostPatientOwner) {
          return createErrorResponse("Accès non autorisé: cette consultation concerne un patient qui n'appartient pas à votre compte", 403);
        }
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from("TreatmentHistory")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return createSuccessResponse(insertData, 201);

      case "PUT":
      case "PATCH":
        // Mettre à jour un historique existant
        if (!historyId) {
          return createErrorResponse("ID d'historique requis pour la mise à jour", 400);
        }
        
        const patchData = await req.json();
        
        // Vérifier si la mise à jour modifie le consultationId
        if (patchData.consultationId) {
          const { data: patchConsultation, error: patchConsultationError } = await supabaseClient
            .from("Consultation")
            .select("patientId")
            .eq("id", patchData.consultationId)
            .maybeSingle();
            
          if (patchConsultationError || !patchConsultation) {
            return createErrorResponse("Nouvelle consultation associée non trouvée", 404);
          }
          
          const isNewConsultationPatientOwner = await verifyPatientOwnership(
            supabaseClient,
            patchConsultation.patientId,
            identity.osteopathId
          );
          
          if (!isNewConsultationPatientOwner) {
            return createErrorResponse("Accès non autorisé: la nouvelle consultation concerne un patient qui n'appartient pas à votre compte", 403);
          }
        }
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("TreatmentHistory")
          .update(patchData)
          .eq("id", historyId)
          .select();

        if (updateError) throw updateError;
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer un historique de traitement
        if (!historyId) {
          return createErrorResponse("ID d'historique requis pour la suppression", 400);
        }

        const { error: deleteError } = await supabaseClient
          .from("TreatmentHistory")
          .delete()
          .eq("id", historyId);

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: historyId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
