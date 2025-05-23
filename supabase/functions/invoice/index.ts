
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  verifyUserAndGetIdentity,
  verifyPatientOwnership,
  verifyAppointmentOwnership,
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
    const invoiceId = url.searchParams.get("id");
    const patientId = url.searchParams.get("patientId");
    const appointmentId = url.searchParams.get("appointmentId");
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    // Vérifier la propriété du patient si fourni
    if (patientId) {
      const isPatientOwner = await verifyPatientOwnership(supabaseClient, patientId, identity.osteopathId);
      if (!isPatientOwner) {
        return createErrorResponse("Accès non autorisé: ce patient n'appartient pas à votre compte", 403);
      }
    }
    
    // Vérifier la propriété du rendez-vous si fourni
    if (appointmentId) {
      const isAppointmentOwner = await verifyAppointmentOwnership(supabaseClient, appointmentId, identity.osteopathId);
      if (!isAppointmentOwner) {
        return createErrorResponse("Accès non autorisé: ce rendez-vous n'appartient pas à votre compte", 403);
      }
    }

    // Pour les opérations de modification sur une facture existante, vérifier la propriété
    if ((method === "PUT" || method === "PATCH" || method === "DELETE") && invoiceId) {
      // Vérifier que la facture appartient à un patient de cet ostéopathe
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from("Invoice")
        .select("patientId")
        .eq("id", invoiceId)
        .maybeSingle();
      
      if (invoiceError || !invoice) {
        return createErrorResponse("Facture non trouvée", 404);
      }
      
      const isPatientOwner = await verifyPatientOwnership(
        supabaseClient,
        invoice.patientId,
        identity.osteopathId
      );
      
      if (!isPatientOwner) {
        return createErrorResponse("Accès non autorisé: cette facture concerne un patient qui n'appartient pas à votre compte", 403);
      }
    }
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (invoiceId) {
          // Récupérer une facture spécifique
          const { data, error } = await supabaseClient
            .from("Invoice")
            .select("*")
            .eq("id", invoiceId)
            .maybeSingle();

          if (error) throw error;
          
          // Vérifier que la facture appartient à un patient de cet ostéopathe
          if (data) {
            const isPatientOwner = await verifyPatientOwnership(
              supabaseClient,
              data.patientId,
              identity.osteopathId
            );
            
            if (!isPatientOwner) {
              return createErrorResponse("Accès non autorisé: cette facture concerne un patient qui n'appartient pas à votre compte", 403);
            }
          }
          
          return createSuccessResponse(data);
        } else if (patientId) {
          // Récupérer les factures d'un patient spécifique
          const { data, error } = await supabaseClient
            .from("Invoice")
            .select("*")
            .eq("patientId", patientId);

          if (error) throw error;
          return createSuccessResponse(data);
        } else if (appointmentId) {
          // Récupérer les factures d'un rendez-vous spécifique
          const { data, error } = await supabaseClient
            .from("Invoice")
            .select("*")
            .eq("appointmentId", appointmentId);

          if (error) throw error;
          return createSuccessResponse(data);
        } else {
          // Récupérer toutes les factures des patients de l'ostéopathe
          // D'abord, récupérer tous les patients de l'ostéopathe
          const { data: patients, error: patientsError } = await supabaseClient
            .from("Patient")
            .select("id")
            .eq("osteopathId", identity.osteopathId);
          
          if (patientsError) throw patientsError;
          
          if (!patients || patients.length === 0) {
            return createSuccessResponse([]);
          }
          
          // Ensuite, récupérer toutes les factures pour ces patients
          const patientIds = patients.map(p => p.id);
          const { data, error } = await supabaseClient
            .from("Invoice")
            .select("*")
            .in("patientId", patientIds);
            
          if (error) throw error;
          return createSuccessResponse(data);
        }

      case "POST":
        // Créer une nouvelle facture
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
        
        // Si un rendez-vous est spécifié, vérifier qu'il appartient aussi à l'ostéopathe
        if (postData.appointmentId) {
          const isAppointmentOwner = await verifyAppointmentOwnership(
            supabaseClient,
            postData.appointmentId,
            identity.osteopathId
          );
          
          if (!isAppointmentOwner) {
            return createErrorResponse("Accès non autorisé: ce rendez-vous n'appartient pas à votre compte", 403);
          }
        }
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Invoice")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return createSuccessResponse(insertData, 201);

      case "PATCH":
        // Mettre à jour une facture existante
        if (!invoiceId) {
          return createErrorResponse("ID de facture requis pour la mise à jour", 400);
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
        
        // Si la mise à jour modifie le rendez-vous, vérifier qu'il appartient aussi à l'ostéopathe
        if (patchData.appointmentId) {
          const isNewAppointmentOwner = await verifyAppointmentOwnership(
            supabaseClient,
            patchData.appointmentId,
            identity.osteopathId
          );
          
          if (!isNewAppointmentOwner) {
            return createErrorResponse("Accès non autorisé: le nouveau rendez-vous n'appartient pas à votre compte", 403);
          }
        }
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Invoice")
          .update(patchData)
          .eq("id", invoiceId)
          .select();

        if (updateError) throw updateError;
        return createSuccessResponse(updateData);

      case "DELETE":
        // Supprimer une facture
        if (!invoiceId) {
          return createErrorResponse("ID de facture requis pour la suppression", 400);
        }

        const { error: deleteError } = await supabaseClient
          .from("Invoice")
          .delete()
          .eq("id", invoiceId);

        if (deleteError) throw deleteError;
        return createSuccessResponse({ id: invoiceId });

      default:
        return createErrorResponse(`Méthode ${method} non supportée`, 405);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return createErrorResponse(error.message || "Une erreur est survenue", 400);
  }
});
