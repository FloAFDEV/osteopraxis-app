
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req: Request) => {
  // Gestion des requêtes preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Authentification
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

  // Client Supabase avec authentification
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
    const historyId = url.searchParams.get("id");
    const consultationId = url.searchParams.get("consultationId");
    const method = req.method;
    
    switch (method) {
      case "GET":
        if (historyId) {
          // Récupérer un historique de traitement spécifique
          const { data, error } = await supabaseClient
            .from("TreatmentHistory")
            .select("*")
            .eq("id", historyId)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (consultationId) {
          // Récupérer l'historique de traitement d'une consultation
          const { data, error } = await supabaseClient
            .from("TreatmentHistory")
            .select("*")
            .eq("consultationId", consultationId);

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Récupérer tout l'historique des traitements
          const { data, error } = await supabaseClient.from("TreatmentHistory").select("*");
          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

      case "POST":
        // Créer un nouvel historique de traitement
        const postData = await req.json();
        const { data: insertData, error: insertError } = await supabaseClient
          .from("TreatmentHistory")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return new Response(JSON.stringify(insertData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });

      case "PATCH":
        // Mettre à jour un historique de traitement existant
        if (!historyId) {
          return new Response(
            JSON.stringify({ error: "ID d'historique requis pour la mise à jour" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        const patchData = await req.json();
        const { data: updateData, error: updateError } = await supabaseClient
          .from("TreatmentHistory")
          .update(patchData)
          .eq("id", historyId)
          .select();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updateData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "DELETE":
        // Supprimer un historique de traitement
        if (!historyId) {
          return new Response(
            JSON.stringify({ error: "ID d'historique requis pour la suppression" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const { error: deleteError } = await supabaseClient
          .from("TreatmentHistory")
          .delete()
          .eq("id", historyId);

        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true, id: historyId }), {
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
