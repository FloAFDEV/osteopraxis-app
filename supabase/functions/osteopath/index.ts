
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
    const osteopathId = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");
    const method = req.method;
    
    switch (method) {
      case "GET":
        if (osteopathId) {
          // Récupérer un ostéopathe spécifique par ID
          const { data, error } = await supabaseClient
            .from("Osteopath")
            .select("*")
            .eq("id", osteopathId)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (userId) {
          // Récupérer un ostéopathe par userId (UUID)
          const { data, error } = await supabaseClient
            .from("Osteopath")
            .select("*")
            .eq("userId", userId)
            .single();

          if (error) {
            // Si aucun résultat, rechercher via la table User
            const { data: userData, error: userError } = await supabaseClient
              .from("User")
              .select("osteopathId")
              .eq("auth_id", userId)
              .maybeSingle();

            if (userError || !userData || !userData.osteopathId) {
              return new Response(
                JSON.stringify({ error: "Ostéopathe non trouvé" }),
                {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                  status: 404,
                }
              );
            }

            // Récupérer les données de l'ostéopathe avec l'ID trouvé
            const { data: osteoData, error: osteoError } = await supabaseClient
              .from("Osteopath")
              .select("*")
              .eq("id", userData.osteopathId)
              .single();

            if (osteoError) throw osteoError;
            return new Response(JSON.stringify(osteoData), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Récupérer tous les ostéopathes
          const { data, error } = await supabaseClient.from("Osteopath").select("*");
          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

      case "POST":
        // Créer un nouvel ostéopathe
        const postData = await req.json();
        
        // Récupérer l'utilisateur actuel
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;
        
        // Vérifier si un ostéopathe existe déjà pour cet utilisateur
        if (user) {
          const { data: existingOsteopath, error: existingError } = await supabaseClient
            .from("Osteopath")
            .select("id")
            .eq("userId", user.id)
            .maybeSingle();
            
          if (existingOsteopath) {
            return new Response(
              JSON.stringify({ 
                error: "Un ostéopathe existe déjà pour cet utilisateur",
                existing: existingOsteopath
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 409,
              }
            );
          }
        }
        
        // Créer l'ostéopathe
        const { data: insertData, error: insertError } = await supabaseClient
          .from("Osteopath")
          .insert({ 
            ...postData,
            userId: user?.id // Lier l'ostéopathe à l'utilisateur actuel
          })
          .select();

        if (insertError) throw insertError;
        return new Response(JSON.stringify(insertData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });

      case "PATCH":
        // Mettre à jour un ostéopathe existant
        if (!osteopathId) {
          return new Response(
            JSON.stringify({ error: "ID d'ostéopathe requis pour la mise à jour" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        const patchData = await req.json();
        const { data: updateData, error: updateError } = await supabaseClient
          .from("Osteopath")
          .update(patchData)
          .eq("id", osteopathId)
          .select();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updateData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case "DELETE":
        // Supprimer un ostéopathe
        if (!osteopathId) {
          return new Response(
            JSON.stringify({ error: "ID d'ostéopathe requis pour la suppression" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const { error: deleteError } = await supabaseClient
          .from("Osteopath")
          .delete()
          .eq("id", osteopathId);

        if (deleteError) throw deleteError;
        return new Response(JSON.stringify({ success: true, id: osteopathId }), {
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
