// deno-lint-ignore-file no-explicit-any
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cabinetId = url.searchParams.get("cabinet_id");

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = Deno.env.toObject();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // Resolve current osteopath id
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_current_osteopath_id");
    if (rpcError || !rpcData) {
      return new Response(JSON.stringify({ error: "Unable to resolve osteopath id" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const currentOsteoId = rpcData as number;

    // Fetch sync rows visible to this osteopath
    let query = supabase
      .from("cabinet_patient_sync")
      .select("id,cabinet_id,owner_osteopath_id,shared_with_osteopath_id,patient_local_hash,sync_permission,updated_at,is_active,expires_at")
      .or(`shared_with_osteopath_id.eq.${currentOsteoId},owner_osteopath_id.eq.${currentOsteoId}`)
      .eq("is_active", true);

    if (cabinetId) {
      query = query.eq("cabinet_id", Number(cabinetId));
    }

    const { data, error } = await query.order("updated_at", { ascending: false });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, syncs: data || [] }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
