
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function verifyUserAndGetIdentity(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return { identity: null, supabaseClient: null, message: "Token d'authentification manquant" };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError || !user) {
    return { identity: null, supabaseClient: null, message: "Token invalide" };
  }

  const { data: userData, error: userDataError } = await supabaseClient
    .from("User")
    .select("id, osteopathId")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (userDataError || !userData?.osteopathId) {
    return { identity: null, supabaseClient: null, message: "Profil ostéopathe non trouvé" };
  }

  return {
    identity: {
      authId: user.id,
      userId: userData.id,
      osteopathId: userData.osteopathId
    },
    supabaseClient
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { identity, supabaseClient, message } = await verifyUserAndGetIdentity(req);
    
    if (!identity) {
      return new Response(JSON.stringify({ error: message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("id");
    const patientId = url.searchParams.get("patientId");
    const method = req.method;

    switch (method) {
      case "GET":
        if (appointmentId) {
          // Récupérer un rendez-vous spécifique - requête simple avec osteopathId
          const { data: appointment, error } = await supabaseClient
            .from("Appointment")
            .select("*")
            .eq("id", appointmentId)
            .eq("osteopathId", identity.osteopathId)
            .maybeSingle();

          if (error) throw error;
          
          if (!appointment) {
            return new Response(JSON.stringify({ error: "Rendez-vous non trouvé" }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }

          return new Response(JSON.stringify({ data: appointment }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else if (patientId) {
          // Récupérer les rendez-vous d'un patient - avec vérification osteopathId
          const { data: appointments, error } = await supabaseClient
            .from("Appointment")
            .select("*")
            .eq("patientId", patientId)
            .eq("osteopathId", identity.osteopathId)
            .order("date", { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify({ data: appointments }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          // Récupérer tous les rendez-vous de l'ostéopathe - requête simple !
          const { data: appointments, error } = await supabaseClient
            .from("Appointment")
            .select("*")
            .eq("osteopathId", identity.osteopathId)
            .order("date", { ascending: true });

          if (error) throw error;

          return new Response(JSON.stringify({ data: appointments }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

      case "POST":
        const postData = await req.json();
        
        // Vérifier que le patient appartient à l'ostéopathe
        if (postData.patientId) {
          const { data: patient, error: patientError } = await supabaseClient
            .from("Patient")
            .select("id, osteopathId")
            .eq("id", postData.patientId)
            .eq("osteopathId", identity.osteopathId)
            .maybeSingle();

          if (patientError || !patient) {
            return new Response(JSON.stringify({ error: "Patient non trouvé ou accès non autorisé" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        }

        // S'assurer que l'osteopathId est inclus dans les données
        postData.osteopathId = identity.osteopathId;

        // Nettoyer les valeurs undefined
        Object.keys(postData).forEach(key => {
          if (postData[key] === undefined) {
            delete postData[key];
          }
        });

        const { data: newAppointment, error: insertError } = await supabaseClient
          .from("Appointment")
          .insert(postData)
          .select()
          .single();

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ data: newAppointment }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      case "PATCH":
      case "PUT":
        if (!appointmentId) {
          return new Response(JSON.stringify({ error: "ID de rendez-vous requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Vérifier que le rendez-vous appartient à l'ostéopathe - requête simple !
        const { data: existingAppointment, error: checkError } = await supabaseClient
          .from("Appointment")
          .select("id")
          .eq("id", appointmentId)
          .eq("osteopathId", identity.osteopathId)
          .maybeSingle();

        if (checkError) throw checkError;
        
        if (!existingAppointment) {
          console.error(`Tentative d'accès non autorisé: ostéopathe ${identity.osteopathId} -> appointment ${appointmentId}`);
          return new Response(JSON.stringify({ error: "Rendez-vous non trouvé ou accès non autorisé" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const patchData = await req.json();
        
        // Nettoyer les valeurs undefined et empêcher la modification de l'osteopathId
        const updateData = { ...patchData };
        delete updateData.id;
        delete updateData.osteopathId; // Empêcher la modification de l'osteopathId
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        updateData.updatedAt = new Date().toISOString();

        const { data: updatedAppointment, error: updateError } = await supabaseClient
          .from("Appointment")
          .update(updateData)
          .eq("id", appointmentId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ data: updatedAppointment }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      case "DELETE":
        if (!appointmentId) {
          return new Response(JSON.stringify({ error: "ID de rendez-vous requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Vérifier que le rendez-vous appartient à l'ostéopathe - requête simple !
        const { data: appointmentToDelete, error: deleteCheckError } = await supabaseClient
          .from("Appointment")
          .select("id")
          .eq("id", appointmentId)
          .eq("osteopathId", identity.osteopathId)
          .maybeSingle();

        if (deleteCheckError) throw deleteCheckError;
        
        if (!appointmentToDelete) {
          console.error(`Tentative de suppression non autorisée: ostéopathe ${identity.osteopathId} -> appointment ${appointmentId}`);
          return new Response(JSON.stringify({ error: "Rendez-vous non trouvé ou accès non autorisé" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { error: deleteError } = await supabaseClient
          .from("Appointment")
          .delete()
          .eq("id", appointmentId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ data: { id: appointmentId } }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      default:
        return new Response(JSON.stringify({ error: `Méthode ${method} non supportée` }), {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    console.error("Erreur dans la fonction appointment:", error);
    return new Response(JSON.stringify({ 
      error: "Erreur serveur", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
