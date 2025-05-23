
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
    const profileId = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");
    const method = req.method;
    
    switch (method) {
      case "GET":
        if (profileId) {
          // Récupérer un profil professionnel spécifique
          const { data, error } = await supabaseClient
            .from("ProfessionalProfile")
            .select("*")
            .eq("id", profileId)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (userId) {
          // Récupérer un profil par userId
          const { data, error } = await supabaseClient
            .from("ProfessionalProfile")
            .select("*")
            .eq("userId", userId)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Récupérer tous les profils professionnels
          const { data, error } = await supabaseClient.from("ProfessionalProfile").select("*");
          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

      case "POST":
        // Créer un nouveau profil professionnel
        const postData = await req.json();
        
        // Récupérer l'utilisateur actuel
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;
        
        // Vérifier si un profil existe déjà pour cet utilisateur
        if (user) {
          const { data: existingProfile, error: existingError } = await supabaseClient
            .from("ProfessionalProfile")
            .select("id")
            .eq("userId", user.id)
            .maybeSingle();
            
          if (existingProfile) {
            return new Response(
              JSON.stringify({ 
                error: "Un profil professionnel existe déjà pour cet utilisateur",
                existing: existingProfile
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 409,
              }
            );
          }
        }
        
        // Créer le profil
        const { data: insertData, error: insertError } = await supabaseClient
          .from("ProfessionalProfile")
          .insert({ 
            ...postData,
            userId: user?.id // Lier le profil à l'utilisateur actuel
          })
          .select();

        if (insertError) throw insertError;
        return new Response(JSON.stringify(insertData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });

      case "PATCH":
        // Mettre à jour un profil professionnel existant
        if (!profileId) {
          return new Response(
            JSON.stringify({ error: "ID de profil requis pour la mise à jour" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        const patchData = await req.json();
        const { data: updateData, error: updateError } = await supabaseClient
          .from("ProfessionalProfile")
          .update(patchData)
          .eq("id", profileId)
          .select();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updateData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "DELETE":
        // Supprimer un profil professionnel
        if (!profileId) {
          return new Response(
            JSON.stringify({ error: "ID de profil requis pour la suppression" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const { error: deleteError } = await supabaseClient
          .from("ProfessionalProfile")
          .delete()
          .eq("id", profileId);

        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true, id: profileId }), {
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
