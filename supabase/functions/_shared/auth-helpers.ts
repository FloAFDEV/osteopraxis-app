
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export interface UserIdentity {
  authId: string;
  userId: string;
  osteopathId: number;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-http-method-override',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export async function verifyUserAndGetIdentity(req: Request): Promise<{ 
  identity: UserIdentity | null; 
  supabaseClient: any; 
  message?: string 
}> {
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

  // Récupérer l'osteopathId via la table Osteopath avec authId
  const { data: osteopathData, error: osteopathError } = await supabaseClient
    .from("Osteopath")
    .select("id")
    .eq("authId", user.id)
    .maybeSingle();

  if (osteopathError || !osteopathData?.id) {
    return { identity: null, supabaseClient: null, message: "Profil ostéopathe non trouvé" };
  }

  return {
    identity: {
      authId: user.id,
      userId: user.id, // Pour compatibilité
      osteopathId: osteopathData.id
    },
    supabaseClient
  };
}

export async function verifyPatientOwnership(
  supabaseClient: any,
  patientId: string | number,
  osteopathId: number
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("Patient")
    .select("id")
    .eq("id", patientId)
    .eq("osteopathId", osteopathId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la vérification de propriété du patient:", error);
    return false;
  }

  return !!data;
}

export async function verifyAppointmentOwnership(
  supabaseClient: any,
  appointmentId: string | number,
  osteopathId: number
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("Appointment")
    .select("id")
    .eq("id", appointmentId)
    .eq("osteopathId", osteopathId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la vérification de propriété du rendez-vous:", error);
    return false;
  }

  return !!data;
}

export function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
