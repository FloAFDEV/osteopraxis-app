import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Creates a standard Supabase client with user authentication
 */
export function createStandardClient(authHeader: string) {
	return createClient(
		Deno.env.get("SUPABASE_URL") || "",
		Deno.env.get("SUPABASE_ANON_KEY") || "",
		{
			global: {
				headers: { Authorization: authHeader },
			},
		}
	);
}

/**
 * Creates an admin client that bypasses RLS using the service role key
 * This client has FULL DATABASE ACCESS and should be used carefully
 */
export function createAdminClient() {
	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

	// Vérification que les variables requises sont disponibles
	if (!supabaseUrl || !serviceRoleKey) {
		console.error("Variables d'environnement manquantes:", {
			supabaseUrl: !!supabaseUrl,
			serviceRoleKey: !!serviceRoleKey,
		});
		throw new Error(
			"ERREUR CRITIQUE: Variables d'environnement requises non définies"
		);
	}

	// Création du client avec options explicites pour assurer l'accès admin
	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
		global: {
			headers: {
				// Ce header est important pour certaines configurations
				"X-Client-Info": "edge-function-admin",
			},
		},
		db: {
			schema: "public",
		},
	});
}

/**
 * Formats a standard error response with CORS headers
 */
export function createErrorResponse(
	message: string,
	details: any = null,
	status = 500
) {
	return new Response(
		JSON.stringify({
			error: message,
			details: details,
		}),
		{
			headers: { ...corsHeaders, "Content-Type": "application/json" },
			status,
		}
	);
}

/**
 * Formats a successful response with CORS headers
 */
export function createSuccessResponse(data: any, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...corsHeaders, "Content-Type": "application/json" },
	});
}
