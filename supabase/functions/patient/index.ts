
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Créer un client Supabase avec les clés d'environnement
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req: Request) => {
  // Cette vérification est importante pour les requêtes preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Récupérer le token d'authentification depuis les en-têtes
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Authentification requise" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Configurer le client Supabase avec le token d'authentification
  const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get("id");
    // Utiliser X-HTTP-Method-Override s'il existe, sinon utiliser la méthode HTTP standard
    const method = req.headers.get("X-HTTP-Method-Override") || req.method;
    
    console.log("Méthode demandée:", method);
    console.log("Patient ID:", patientId);
    
    // Traiter la demande en fonction de la méthode HTTP
    switch (method) {
      case "GET":
        if (patientId) {
          // Récupérer un patient spécifique
          const { data, error } = await supabaseClient
            .from("Patient")
            .select("*")
            .eq("id", patientId)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Récupérer tous les patients
          const { data, error } = await supabaseClient.from("Patient").select("*");
          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

      case "POST":
        // Créer un nouveau patient
        const postData = await req.json();
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Patient")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return new Response(JSON.stringify(insertData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });

      case "PATCH":
        // Mettre à jour un patient existant
        if (!patientId) {
          return new Response(
            JSON.stringify({ error: "ID patient requis pour la mise à jour" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        const patchData = await req.json();
        console.log("Données de mise à jour:", patchData);
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Patient")
          .update(patchData)
          .eq("id", patientId)
          .select();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updateData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "DELETE":
        // Supprimer un patient
        if (!patientId) {
          return new Response(
            JSON.stringify({ error: "ID patient requis pour la suppression" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const { error: deleteError } = await supabaseClient
          .from("Patient")
          .delete()
          .eq("id", patientId);

        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true, id: patientId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      default:
        return new Response(
          JSON.stringify({ error: `Méthode ${method} non supportée` }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 405,
          }
        );
    }
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Une erreur est survenue" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
