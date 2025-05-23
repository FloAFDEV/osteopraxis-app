
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
    const cabinetId = url.searchParams.get("id");
    const osteopathId = url.searchParams.get("osteopathId");
    const method = req.method;
    
    switch (method) {
      case "GET":
        if (cabinetId) {
          // Récupérer un cabinet spécifique
          const { data, error } = await supabaseClient
            .from("Cabinet")
            .select("*")
            .eq("id", cabinetId)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (osteopathId) {
          // Récupérer les cabinets d'un ostéopathe
          const { data, error } = await supabaseClient
            .from("Cabinet")
            .select("*")
            .eq("osteopathId", osteopathId);

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Récupérer tous les cabinets
          const { data, error } = await supabaseClient.from("Cabinet").select("*");
          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

      case "POST":
        // Créer un nouveau cabinet
        const postData = await req.json();
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Cabinet")
          .insert(postData)
          .select();

        if (insertError) throw insertError;
        return new Response(JSON.stringify(insertData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });

      case "PATCH":
        // Mettre à jour un cabinet existant
        if (!cabinetId) {
          return new Response(
            JSON.stringify({ error: "ID du cabinet requis pour la mise à jour" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        const patchData = await req.json();
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Cabinet")
          .update(patchData)
          .eq("id", cabinetId)
          .select();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updateData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "DELETE":
        // Supprimer un cabinet
        if (!cabinetId) {
          return new Response(
            JSON.stringify({ error: "ID du cabinet requis pour la suppression" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const { error: deleteError } = await supabaseClient
          .from("Cabinet")
          .delete()
          .eq("id", cabinetId);

        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true, id: cabinetId }), {
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
