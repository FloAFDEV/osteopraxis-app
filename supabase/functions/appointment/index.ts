import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import {
	createErrorResponse,
	createSuccessResponse,
	verifyAppointmentOwnership,
	verifyPatientOwnership,
	verifyUserAndGetIdentity,
} from "../_shared/auth-helpers.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
	// Cette vérification est importante pour les requêtes preflight CORS
	if (req.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				...corsHeaders,
				"Content-Length": "0",
			},
		});
	}

	// Vérifier l'identité de l'utilisateur et récupérer le client Supabase authentifié
	const { identity, supabaseClient, message } =
		await verifyUserAndGetIdentity(req);

	if (!identity) {
		return createErrorResponse(message || "Authentification requise", 401);
	}

	try {
		const url = new URL(req.url);
		const appointmentId = url.searchParams.get("id");
		const patientId = url.searchParams.get("patientId");
		const method = req.headers.get("X-HTTP-Method-Override") || req.method;

		// Support de l'en-tête pour les annulations
		const isCancellation =
			req.headers.get("X-Cancellation-Override") === "true";

		// Vérifier la propriété du patient si fourni
		if (patientId) {
			const isPatientOwner = await verifyPatientOwnership(
				supabaseClient,
				patientId,
				identity.osteopathId
			);
			if (!isPatientOwner) {
				return createErrorResponse(
					"Accès non autorisé: ce patient n'appartient pas à votre compte",
					403
				);
			}
		}

		// Pour les opérations de modification sur un RDV existant, vérifier la propriété
		if (
			(method === "PUT" || method === "PATCH" || method === "DELETE") &&
			appointmentId
		) {
			// Les annulations sont traitées différemment
			if (!isCancellation) {
				const isAppointmentOwner = await verifyAppointmentOwnership(
					supabaseClient,
					appointmentId,
					identity.osteopathId
				);
				if (!isAppointmentOwner) {
					return createErrorResponse(
						"Accès non autorisé: ce rendez-vous n'appartient pas à votre compte",
						403
					);
				}
			}
		}

		// Préparer les options de requête pour les annulations
		const options = isCancellation
			? {
					headers: {
						"X-Cancellation-Override": "true",
					},
			  }
			: {};

		// Traiter la demande en fonction de la méthode HTTP
		switch (method) {
			case "GET":
				if (appointmentId) {
					// Récupérer un RDV spécifique
					const { data, error } = await supabaseClient
						.from("Appointment")
						.select("*")
						.eq("id", appointmentId)
						.maybeSingle();

					if (error) throw error;

					// Vérifier que le RDV appartient à un patient de cet ostéopathe
					if (data) {
						const isPatientOwner = await verifyPatientOwnership(
							supabaseClient,
							data.patientId,
							identity.osteopathId
						);

						if (!isPatientOwner) {
							return createErrorResponse(
								"Accès non autorisé: ce rendez-vous concerne un patient qui n'appartient pas à votre compte",
								403
							);
						}
					}

					return createSuccessResponse(data);
				} else if (patientId) {
					// Récupérer les RDV d'un patient spécifique
					const { data, error } = await supabaseClient
						.from("Appointment")
						.select("*")
						.eq("patientId", patientId);

					if (error) throw error;
					return createSuccessResponse(data);
				} else {
					// Récupérer tous les RDV des patients de l'ostéopathe
					// D'abord, récupérer tous les patients de l'ostéopathe
					const { data: patients, error: patientsError } =
						await supabaseClient
							.from("Patient")
							.select("id")
							.eq("osteopathId", identity.osteopathId);

					if (patientsError) throw patientsError;

					if (!patients || patients.length === 0) {
						return createSuccessResponse([]);
					}

					// Ensuite, récupérer tous les RDV pour ces patients
					const patientIds = patients.map((p) => p.id);
					const { data, error } = await supabaseClient
						.from("Appointment")
						.select("*")
						.in("patientId", patientIds);

					if (error) throw error;
					return createSuccessResponse(data);
				}

			case "POST":
				// Créer un nouveau RDV
				const postData = await req.json();

				// Vérifier que le patient appartient bien à l'ostéopathe
				const isPostPatientOwner = await verifyPatientOwnership(
					supabaseClient,
					postData.patientId,
					identity.osteopathId
				);

				if (!isPostPatientOwner) {
					return createErrorResponse(
						"Accès non autorisé: ce patient n'appartient pas à votre compte",
						403
					);
				}

				// Supprimer la propriété end si elle existe
				if (postData.end) {
					delete postData.end;
				}

				const { data: insertData, error: insertError } =
					await supabaseClient
						.from("Appointment")
						.insert(postData)
						.select();

				if (insertError) throw insertError;
				return createSuccessResponse(insertData, 201);

			case "PUT":
			case "PATCH":
				// Mettre à jour un RDV existant
				if (!appointmentId) {
					return createErrorResponse(
						"ID du rendez-vous requis pour la mise à jour",
						400
					);
				}

				const patchData = await req.json();

				// Vérifier si la mise à jour modifie le patientId
				if (patchData.patientId && !isCancellation) {
					const isNewPatientOwner = await verifyPatientOwnership(
						supabaseClient,
						patchData.patientId,
						identity.osteopathId
					);

					if (!isNewPatientOwner) {
						return createErrorResponse(
							"Accès non autorisé: le nouveau patient n'appartient pas à votre compte",
							403
						);
					}
				}

				// Supprimer la propriété end si elle existe
				if (patchData.end) {
					delete patchData.end;
				}

				const { data: updateData, error: updateError } =
					await supabaseClient
						.from("Appointment")
						.update(patchData)
						.eq("id", appointmentId)
						.select(null, options);

				if (updateError) throw updateError;
				return createSuccessResponse(
					updateData || { success: true, id: appointmentId }
				);

			case "DELETE":
				// Supprimer un RDV
				if (!appointmentId) {
					return createErrorResponse(
						"ID du rendez-vous requis pour la suppression",
						400
					);
				}

				const { error: deleteError } = await supabaseClient
					.from("Appointment")
					.delete()
					.eq("id", appointmentId);

				if (deleteError) throw deleteError;
				return createSuccessResponse({ id: appointmentId });

			default:
				return createErrorResponse(
					`Méthode ${method} non supportée`,
					405
				);
		}
	} catch (error) {
		console.error("Erreur:", error);
		return createErrorResponse(
			error.message || "Une erreur est survenue",
			400
		);
	}
});
