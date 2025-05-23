
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { corsHeaders } from "./cors.ts";

export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

/**
 * Crée un client Supabase authentifié avec le token fourni dans l'en-tête
 * @param authHeader Le header d'authentification
 * @returns Client Supabase authentifié ou null si échec
 */
export function createAuthenticatedClient(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Structure contenant les informations d'identité de l'utilisateur
 */
export interface UserIdentity {
  userId: string;
  osteopathId: number;
}

/**
 * Génère une réponse d'erreur avec les en-têtes CORS appropriés
 * @param message Message d'erreur
 * @param status Code de statut HTTP
 * @returns Response object
 */
export function createErrorResponse(message: string, status = 403) {
  return new Response(
    JSON.stringify({
      error: message,
      success: false,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Génère une réponse de succès avec les en-têtes CORS appropriés
 * @param data Les données à renvoyer
 * @param status Code de statut HTTP
 * @returns Response object
 */
export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({
      data,
      success: true,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Fonction centrale pour vérifier l'authentification et récupérer l'identité de l'utilisateur
 * @param req Requête HTTP
 * @returns L'identité de l'utilisateur ou null en cas d'échec, et un client Supabase authentifié
 */
export async function verifyUserAndGetIdentity(req: Request): Promise<{ identity: UserIdentity | null, supabaseClient: any, message?: string }> {
  // 1. Vérifier l'en-tête d'authentification
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { identity: null, supabaseClient: null, message: "Authentification requise" };
  }

  // 2. Créer un client Supabase authentifié
  const supabaseClient = createAuthenticatedClient(authHeader);
  if (!supabaseClient) {
    return { identity: null, supabaseClient: null, message: "Impossible de créer le client Supabase" };
  }

  try {
    // 3. Récupérer l'utilisateur connecté
    const { data: authData, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authData.user) {
      return { identity: null, supabaseClient, message: "Utilisateur non authentifié" };
    }

    const userId = authData.user.id;
    console.log("Utilisateur authentifié:", userId);

    // 4. D'abord, essayer de récupérer l'osteopathId depuis la table User
    const { data: userData, error: userError } = await supabaseClient
      .from("User")
      .select("osteopathId")
      .eq("auth_id", userId)
      .maybeSingle();

    // Si on trouve un osteopathId dans User, c'est la méthode préférée
    if (!userError && userData?.osteopathId) {
      console.log("OsteopathId trouvé dans User:", userData.osteopathId);
      return {
        identity: {
          userId,
          osteopathId: userData.osteopathId,
        },
        supabaseClient,
      };
    }

    // 5. Si pas trouvé dans User, chercher dans Osteopath
    const { data: osteopathData, error: osteopathError } = await supabaseClient
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();

    if (osteopathError || !osteopathData) {
      console.error("Erreur lors de la récupération de l'ostéopathe:", osteopathError || "Aucun ostéopathe trouvé");
      return { 
        identity: null, 
        supabaseClient, 
        message: "Impossible de vérifier l'ostéopathe. Assurez-vous d'avoir complété votre profil professionnel." 
      };
    }

    console.log("OsteopathId trouvé via Osteopath:", osteopathData.id);
    return {
      identity: {
        userId,
        osteopathId: osteopathData.id,
      },
      supabaseClient,
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'identité:", error);
    return { identity: null, supabaseClient, message: "Erreur lors de la vérification de l'identité" };
  }
}

/**
 * Vérifie si un patient appartient à l'ostéopathe spécifié
 * @param supabaseClient Client Supabase authentifié
 * @param patientId ID du patient à vérifier
 * @param osteopathId ID de l'ostéopathe
 * @returns true si le patient appartient à l'ostéopathe, false sinon
 */
export async function verifyPatientOwnership(
  supabaseClient: any, 
  patientId: number | string, 
  osteopathId: number
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from("Patient")
      .select("id")
      .eq("id", patientId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la vérification du patient:", error);
      return false;
    }

    return !!data; // Retourne true si un patient a été trouvé, false sinon
  } catch (error) {
    console.error("Exception lors de la vérification du patient:", error);
    return false;
  }
}

/**
 * Vérifie si un cabinet appartient à l'ostéopathe spécifié
 * @param supabaseClient Client Supabase authentifié
 * @param cabinetId ID du cabinet à vérifier
 * @param osteopathId ID de l'ostéopathe
 * @returns true si le cabinet appartient à l'ostéopathe, false sinon
 */
export async function verifyCabinetOwnership(
  supabaseClient: any, 
  cabinetId: number | string, 
  osteopathId: number
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from("Cabinet")
      .select("id")
      .eq("id", cabinetId)
      .eq("osteopathId", osteopathId)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la vérification du cabinet:", error);
      return false;
    }

    return !!data; // Retourne true si un cabinet a été trouvé, false sinon
  } catch (error) {
    console.error("Exception lors de la vérification du cabinet:", error);
    return false;
  }
}

/**
 * Vérifie si un rendez-vous appartient à l'ostéopathe spécifié (via le patient)
 * @param supabaseClient Client Supabase authentifié
 * @param appointmentId ID du rendez-vous à vérifier
 * @param osteopathId ID de l'ostéopathe
 * @returns true si le rendez-vous appartient à l'ostéopathe, false sinon
 */
export async function verifyAppointmentOwnership(
  supabaseClient: any, 
  appointmentId: number | string, 
  osteopathId: number
): Promise<boolean> {
  try {
    // D'abord, récupérer le patientId associé au rendez-vous
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("Appointment")
      .select("patientId")
      .eq("id", appointmentId)
      .maybeSingle();

    if (appointmentError || !appointment) {
      console.error("Erreur lors de la récupération du rendez-vous:", appointmentError || "Rendez-vous non trouvé");
      return false;
    }

    // Ensuite, vérifier si ce patient appartient à l'ostéopathe
    return await verifyPatientOwnership(supabaseClient, appointment.patientId, osteopathId);
  } catch (error) {
    console.error("Exception lors de la vérification du rendez-vous:", error);
    return false;
  }
}
