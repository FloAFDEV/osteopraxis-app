
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
	createStandardClient,
	createErrorResponse,
	createSuccessResponse,
} from "./utils.ts";
import {
	findOsteopathByUserId,
	updateOsteopath,
	createOsteopath,
	updateUserWithOsteopathId,
	ensureUserExists,
} from "./osteopath-service.ts";

serve(async (req: Request) => {
	// CORS preflight - assurez-vous que cette partie est correcte
	if (req.method === "OPTIONS") {
		return new Response("OK", {
			status: 204,
  headers: {
        ...corsHeaders,
        "Content-Length": "0",
      },		});
	}

	const authHeader = req.headers.get("Authorization");
	console.log("Authorization header présent:", !!authHeader);

	if (!authHeader) {
		return createErrorResponse(
			"Aucun token d'authentification fourni",
			null,
			401
		);
	}

	const supabaseClient = createStandardClient(authHeader);

	try {
		const {
			data: { user },
			error: userError,
		} = await supabaseClient.auth.getUser();

		if (userError || !user) {
			console.error(
				"Erreur de récupération de l'utilisateur:",
				userError
			);
			return createErrorResponse(
				"Erreur de récupération de l'utilisateur",
				userError,
				401
			);
		}

		const method = req.headers.get("X-HTTP-Method-Override") || req.method;
		console.log("Méthode effective:", method);
		console.log("User ID trouvé:", user.id);

		let osteopathData;
		try {
			const requestData = await req.json();
			osteopathData = requestData.osteopathData;

			if (osteopathData && !osteopathData.name && user.email) {
				osteopathData.name = user.email.split("@")[0];
			}

			console.log("Données reçues:", osteopathData);
		} catch (jsonError) {
			console.error(
				"Erreur lors de la lecture du corps de la requête:",
				jsonError
			);
			return createErrorResponse(
				"Erreur de lecture du corps de la requête",
				String(jsonError),
				400
			);
		}

		if (!osteopathData) {
			console.error("Pas de données d'ostéopathe fournies");
			return createErrorResponse(
				"Pas de données d'ostéopathe fournies",
				null,
				400
			);
		}

		console.log(
			"Tentative de création/récupération d'ostéopathe pour l'utilisateur:",
			user.id
		);

		try {
			await ensureUserExists(user);

			const existingOsteopath = await findOsteopathByUserId(user.id);

			if (existingOsteopath) {
				console.log(
					"Ostéopathe existant trouvé:",
					existingOsteopath.id
				);
			} else {
				console.log("Aucun ostéopathe trouvé, création nécessaire");
			}

			let result;

			if (existingOsteopath) {
				if (existingOsteopath.userId !== user.id) {
					return createErrorResponse(
						"Vous ne pouvez pas modifier les données d'un autre utilisateur",
						null,
						403
					);
				}

				const updatedOsteopath = await updateOsteopath(
					existingOsteopath.id,
					osteopathData,
					existingOsteopath
				);
				result = {
					osteopath: updatedOsteopath,
					operation: "mise à jour",
					success: true,
				};
			} else {
				const newOsteopath = await createOsteopath(
					user.id,
					osteopathData
				);
				result = {
					osteopath: newOsteopath,
					operation: "création",
					success: true,
				};
			}

			if (result.osteopath && result.osteopath.id) {
				try {
					const userUpdated = await updateUserWithOsteopathId(
						user.id,
						result.osteopath.id
					);
					result.userUpdated = userUpdated;
				} catch (userUpdateError: any) {
					result.userUpdateError = userUpdateError.message;
				}
			}

			return createSuccessResponse(result);
		} catch (processingError: any) {
			console.error(
				"Erreur lors du traitement de la demande:",
				processingError
			);
			return createErrorResponse(
				"Erreur lors du traitement",
				processingError.message
			);
		}
	} catch (error: any) {
		console.error("Erreur dans la fonction edge:", error);
		return createErrorResponse("Erreur serveur", {
			message: error.message || String(error),
			stack: error.stack,
		});
	}
});
