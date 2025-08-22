
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Cache simple en mémoire pour améliorer les performances
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Nettoyer le cache si il devient trop gros (éviter les fuites mémoire)
  if (cache.size > 50) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    // Supprimer les 10 plus anciens
    for (let i = 0; i < 10; i++) {
      cache.delete(entries[i][0]);
    }
  }
}

async function verifyUserAndGetIdentity(req: Request): Promise<{ identity: any; supabaseClient: any; message?: string }> {
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

  // Récupérer les données utilisateur
  const { data: userData, error: userDataError } = await supabaseClient
    .from("User")
    .select("id, osteopathId, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (userDataError) {
    return { identity: null, supabaseClient: null, message: "Erreur lors de la récupération du profil utilisateur" };
  }

  if (!userData) {
    return { identity: null, supabaseClient: null, message: "Profil utilisateur non trouvé" };
  }

  // Pour les admins, pas besoin d'osteopathId
  if (userData.role === 'ADMIN') {
    return {
      identity: {
        authId: user.id,
        userId: userData.id,
        role: userData.role,
        isAdmin: true
      },
      supabaseClient
    };
  }

  // Pour les ostéopathes, vérifier l'osteopathId
  if (!userData.osteopathId) {
    return { identity: null, supabaseClient: null, message: "Profil ostéopathe non trouvé" };
  }

  return {
    identity: {
      authId: user.id,
      userId: userData.id,
      osteopathId: userData.osteopathId,
      role: userData.role,
      isAdmin: false
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
    const cabinetId = url.searchParams.get("id");
    const method = req.method;

    switch (method) {
      case "GET":
        if (cabinetId) {
          // Vérifier le cache d'abord pour un cabinet spécifique
          const cacheKey = `cabinet_${cabinetId}_${identity.authId}`;
          const cachedCabinet = getCachedData(cacheKey);
          
          if (cachedCabinet) {
            return new Response(JSON.stringify({ data: cachedCabinet }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          // Récupérer un cabinet spécifique (propriétaire ou associé)
          let query = supabaseClient
            .from("Cabinet")
            .select("*")
            .eq("id", cabinetId);

          if (!identity.isAdmin) {
            // Inclure les cabinets associés via osteopath_cabinet
            const { data: assoc, error: assocErr } = await supabaseClient
              .rpc('get_osteopath_cabinets', { osteopath_auth_id: identity.authId });
            if (assocErr) throw assocErr;
            const assocIds: number[] = (assoc || []).map((r: any) => r.cabinet_id);

            if (assocIds.length > 0) {
              query = query.or(`osteopathId.eq.${identity.osteopathId},id.in.(${assocIds.join(',')})`);
            } else {
              query = query.eq("osteopathId", identity.osteopathId);
            }
          }

          const { data: cabinet, error } = await query.maybeSingle();
          if (error) throw error;

          if (!cabinet) {
            return new Response(JSON.stringify({ error: "Cabinet non trouvé" }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }

          // Mettre en cache le résultat
          setCachedData(cacheKey, cabinet);

          return new Response(JSON.stringify({ data: cabinet }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          // Vérifier le cache pour la liste des cabinets
          const listCacheKey = `cabinets_list_${identity.authId}`;
          const cachedCabinets = getCachedData(listCacheKey);
          
          if (cachedCabinets) {
            return new Response(JSON.stringify({ data: cachedCabinets }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          // Pour les admins, récupérer tous les cabinets
          // Pour les ostéopathes, récupérer propriétaires + associés
          let query = supabaseClient.from("Cabinet").select("*");

          if (!identity.isAdmin) {
            const { data: assoc, error: assocErr } = await supabaseClient
              .rpc('get_osteopath_cabinets', { osteopath_auth_id: identity.authId });
            if (assocErr) throw assocErr;
            const assocIds: number[] = (assoc || []).map((r: any) => r.cabinet_id);

            if (assocIds.length > 0) {
              query = query.or(`osteopathId.eq.${identity.osteopathId},id.in.(${assocIds.join(',')})`);
            } else {
              query = query.eq("osteopathId", identity.osteopathId);
            }
          }

          const { data: cabinets, error } = await query;
          if (error) throw error;

          // Mettre en cache la liste
          setCachedData(listCacheKey, cabinets);

          return new Response(JSON.stringify({ data: cabinets }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

      case "POST":
        const postData = await req.json();
        
        // S'assurer que le cabinet est associé à l'ostéopathe connecté
        const cabinetData = {
          ...postData,
          osteopathId: identity.osteopathId
        };

        // Nettoyer les valeurs undefined
        Object.keys(cabinetData).forEach(key => {
          if (cabinetData[key] === undefined) {
            delete cabinetData[key];
          }
        });

        const { data: newCabinet, error: insertError } = await supabaseClient
          .from("Cabinet")
          .insert(cabinetData)
          .select()
          .single();

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ data: newCabinet }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      case "PATCH":
      case "PUT":
        if (!cabinetId) {
          return new Response(JSON.stringify({ error: "ID de cabinet requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Vérifier que le cabinet appartient à l'ostéopathe
        const { data: existingCabinet, error: checkError } = await supabaseClient
          .from("Cabinet")
          .select("id, osteopathId")
          .eq("id", cabinetId)
          .eq("osteopathId", identity.osteopathId)
          .maybeSingle();

        if (checkError) throw checkError;
        
        if (!existingCabinet) {
          console.error(`Tentative d'accès non autorisé: ostéopathe ${identity.osteopathId} -> cabinet ${cabinetId}`);
          return new Response(JSON.stringify({ error: "Cabinet non trouvé ou accès non autorisé" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const patchData = await req.json();
        
        // Empêcher la modification de l'osteopathId
        const updateData = { ...patchData };
        delete updateData.osteopathId;
        delete updateData.id;

        // Nettoyer les valeurs undefined
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        updateData.updatedAt = new Date().toISOString();

        const { data: updatedCabinet, error: updateError } = await supabaseClient
          .from("Cabinet")
          .update(updateData)
          .eq("id", cabinetId)
          .eq("osteopathId", identity.osteopathId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ data: updatedCabinet }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      case "DELETE":
        if (!cabinetId) {
          return new Response(JSON.stringify({ error: "ID de cabinet requis" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Vérifier que le cabinet appartient à l'ostéopathe
        const { data: cabinetToDelete, error: deleteCheckError } = await supabaseClient
          .from("Cabinet")
          .select("id")
          .eq("id", cabinetId)
          .eq("osteopathId", identity.osteopathId)
          .maybeSingle();

        if (deleteCheckError) throw deleteCheckError;
        
        if (!cabinetToDelete) {
          console.error(`Tentative de suppression non autorisée: ostéopathe ${identity.osteopathId} -> cabinet ${cabinetId}`);
          return new Response(JSON.stringify({ error: "Cabinet non trouvé ou accès non autorisé" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { error: deleteError } = await supabaseClient
          .from("Cabinet")
          .delete()
          .eq("id", cabinetId)
          .eq("osteopathId", identity.osteopathId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ data: { id: cabinetId } }), {
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
    console.error("Erreur dans la fonction cabinet:", error);
    return new Response(JSON.stringify({ 
      error: "Erreur serveur", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
