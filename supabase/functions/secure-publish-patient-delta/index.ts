// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = Deno.env.toObject();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const body = await req.json();
    const {
      cabinet_id,
      shared_with_osteopath_id,
      patient_local_hash,
      patient_sync_key_hash,
      sync_permission = "read",
      meta = {},
    } = body || {};

    if (!cabinet_id || !shared_with_osteopath_id || !patient_local_hash || !patient_sync_key_hash) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Resolve current osteopath id
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_current_osteopath_id");
    if (rpcError || !rpcData) {
      return new Response(JSON.stringify({ error: "Unable to resolve osteopath id" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const owner_osteopath_id = rpcData as number;

    // Insert sync row
    const { data: inserted, error: insertError } = await supabase
      .from("cabinet_patient_sync")
      .insert({
        cabinet_id,
        owner_osteopath_id,
        shared_with_osteopath_id,
        patient_local_hash,
        patient_sync_key_hash,
        sync_permission,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Log publish action
    await supabase.from("cabinet_sync_logs").insert({
      sync_id: inserted.id,
      action: "publish",
      performed_by_osteopath_id: owner_osteopath_id,
      metadata: meta,
    });

    return new Response(JSON.stringify({ success: true, id: inserted.id }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
