import { Appointment, AppointmentStatus } from "@/types";
import {
	supabase,
	SUPABASE_API_URL,
	SUPABASE_API_KEY,
	ensureAppointmentStatus,
} from "./utils";
import { corsHeaders } from "@/services/corsHeaders";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

// Type plus spécifique pour la création d'appointment
type CreateAppointmentPayload = {
	date: string;
	patientId: number;
	reason: string;
	status?: AppointmentStatus;
	cabinetId?: number;
	notificationSent?: boolean;
};

// Type pour l'objet réellement envoyé à Supabase
type InsertableAppointment = {
	date: string;
	patientId: number;
	reason: string;
	status: AppointmentStatus;
	cabinetId?: number;
	notificationSent: boolean;
};

// Type pour les mises à jour d'appointment
type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export const supabaseAppointmentService = {
	async getAppointments(): Promise<Appointment[]> {
		try {
			console.log("Chargement des rendez-vous depuis Supabase");
			
			// Récupérer l'ID de l'ostéopathe connecté
			const osteopathId = await getCurrentOsteopathId();
			
			// Récupérer d'abord les patients liés à cet ostéopathe
			const { data: patients, error: patientError } = await supabase
				.from("Patient")
				.select("id")
				.eq("osteopathId", osteopathId);
				
			if (patientError) {
				console.error("Erreur de chargement des patients:", patientError);
				throw patientError;
			}
			
			// Si aucun patient trouvé, retourner un tableau vide
			if (!patients || patients.length === 0) {
				console.log("Aucun patient trouvé pour l'ostéopathe", osteopathId);
				return [];
			}
			
			// Extraire les IDs de patients pour le filtre
			const patientIds = patients.map(p => p.id);
			console.log(`Filtrage des rendez-vous pour ${patientIds.length} patients de l'ostéopathe ${osteopathId}`);
			
			// Récupérer les rendez-vous pour les patients de cet ostéopathe
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.in("patientId", patientIds)
				.order("date", { ascending: true });

			if (error) {
				console.error("Erreur de chargement des rendez-vous:", error);
				throw error;
			}

			console.log(`${data?.length || 0} rendez-vous chargés pour l'ostéopathe ${osteopathId}`);
			return data || [];
		} catch (error) {
			console.error("Error fetching appointments:", error);
			throw error;
		}
	},

	async getAppointmentById(id: number): Promise<Appointment> {
		try {
			console.log(`Chargement du rendez-vous ${id}`);
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("id", id)
				.maybeSingle();

			if (error) throw error;
			if (!data) throw new Error(`Appointment with id ${id} not found`);

			return data;
		} catch (error) {
			console.error("Error fetching appointment:", error);
			throw error;
		}
	},

	async getAppointmentsByPatientId(
		patientId: number
	): Promise<Appointment[]> {
		try {
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("patientId", patientId)
				.order("date", { ascending: true });

			if (error) throw error;

			return data || [];
		} catch (error) {
			console.error("Error fetching patient appointments:", error);
			throw error;
		}
	},

	// Nouvelle fonction pour récupérer les rendez-vous du jour pour un patient
	async getTodayAppointmentForPatient(
		patientId: number
	): Promise<Appointment | null> {
		try {
			// Obtenir la date du jour (début et fin)
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			console.log(
				`Recherche des rendez-vous pour le patient ${patientId} aujourd'hui (${today.toISOString()} - ${tomorrow.toISOString()})`
			);

			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("patientId", patientId)
				.gte("date", today.toISOString())
				.lt("date", tomorrow.toISOString())
				.order("date", { ascending: false })
				.maybeSingle();

			if (error) {
				console.error(
					"Erreur lors de la recherche des rendez-vous du jour:",
					error
				);
				throw error;
			}

			return data;
		} catch (error) {
			console.error("Error fetching today's appointments:", error);
			throw error;
		}
	},
	
	async createAppointment(
		payload: CreateAppointmentPayload
	): Promise<Appointment> {
		try {
			console.log("Création d'un nouveau rendez-vous:", payload);
			
			// Vérifier que le patient appartient bien à l'ostéopathe connecté
			const osteopathId = await getCurrentOsteopathId();
			
			const { data: patientCheck, error: patientError } = await supabase
				.from("Patient")
				.select("osteopathId")
				.eq("id", payload.patientId)
				.maybeSingle();
				
			if (patientError || !patientCheck) {
				console.error("Patient introuvable ou erreur:", patientError);
				throw new Error("Patient introuvable");
			}
			
			if (patientCheck.osteopathId !== osteopathId) {
				console.error("Tentative d'accès non autorisé: le patient n'appartient pas à cet ostéopathe");
				throw new Error("Vous n'êtes pas autorisé à créer un rendez-vous pour ce patient");
			}

			// Création de l'objet à insérer - sans les champs timestamp qui sont auto-générés par la DB
			const insertable: InsertableAppointment = {
				date: payload.date,
				patientId: payload.patientId,
				reason: payload.reason,
				cabinetId: payload.cabinetId,
				status: ensureAppointmentStatus(payload.status),
				notificationSent: payload.notificationSent ?? false,
			};

			const { data, error } = await supabase
				.from("Appointment")
				.insert(insertable)
				.select()
				.single();

			if (error) {
				console.error("[SUPABASE ERROR]", error.code, error.message);
				throw error;
			}

			console.log("Rendez-vous créé avec succès:", data);
			return data;
		} catch (error: any) {
			console.error("Error creating appointment:", error);
			throw error;
		}
	},

	async updateAppointment(
		id: number,
		update: UpdateAppointmentPayload
	): Promise<Appointment> {
		try {
			console.log(`Mise à jour du rendez-vous ${id}:`, update);

			// 1. Récupérer le token d'auth utilisateur
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session?.access_token) {
				throw new Error("Utilisateur non authentifié");
			}
			const token = session.access_token;

			// 2. Utiliser les constantes importées pour l'URL et la clé API
			if (!SUPABASE_API_URL || !SUPABASE_API_KEY) {
				throw new Error(
					"Configuration Supabase manquante (URL ou clé API)"
				);
			}

			const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Appointment?id=eq.${id}`;

			// 3. Préparer le payload (nettoyage undefined)
			const updatePayload = {
				id: id, // IMPORTANT: inclure l'ID dans le corps
				...update,
				status: update.status
					? ensureAppointmentStatus(update.status)
					: undefined,
				updatedAt: new Date().toISOString(),
			};

			// Supprimer les champs undefined pour ne pas les envoyer dans la requête
			Object.keys(updatePayload).forEach(
				(k) =>
					(updatePayload as any)[k] === undefined &&
					delete (updatePayload as any)[k]
			);

			// 4. Ajouter une option de bypass des contraintes pour les annulations
			let extraHeaders = {};
			if (updatePayload.status === "CANCELED") {
				// Ajout d'un header spécial qui sera détecté par notre politique RLS
				// pour autoriser l'annulation sans vérifier les conflits d'horaire
				extraHeaders = {
					"X-Cancellation-Override": "true",
				};
			}

			console.log("En-têtes de la requête:", {
				...corsHeaders,
				...extraHeaders,
			});

			// 5. Utiliser PUT au lieu de PATCH (plus compatible avec les configurations CORS)
			const res = await fetch(URL_ENDPOINT, {
				method: "PUT", // Utiliser PUT au lieu de PATCH pour éviter les problèmes CORS
				headers: {
					apikey: SUPABASE_API_KEY,
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					Prefer: "return=representation",
					...corsHeaders,
					...extraHeaders,
				},
				body: JSON.stringify(updatePayload),
			});

			if (!res.ok) {
				const errText = await res.text();
				console.error(`Erreur HTTP ${res.status}:`, errText);
				throw new Error(`Erreur HTTP ${res.status}: ${errText}`);
			}

			// La réponse est toujours un array d'1 element via PostgREST
			const data = await res.json();
			console.log("Réponse de Supabase:", data);

			if (Array.isArray(data) && data.length > 0) return data[0];
			// fallback : parfois selon Prefer/headers c'est un objet direct
			if (data && typeof data === "object") return data as Appointment;
			throw new Error(
				"Aucune donnée retournée lors de la modification du rendez-vous"
			);
		} catch (error) {
			console.error("[SUPABASE ERROR]", error);
			throw error;
		}
	},

	// Méthode spécifique pour annuler un rendez-vous sans modifier l'heure
	async cancelAppointment(id: number): Promise<Appointment> {
		try {
			console.log(`Annulation du rendez-vous ${id}`);

			// 1. Récupérer le token d'auth utilisateur
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session?.access_token) {
				throw new Error("Utilisateur non authentifié");
			}
			const token = session.access_token;

			// Utiliser les constantes importées
			if (!SUPABASE_API_URL || !SUPABASE_API_KEY) {
				throw new Error(
					"Configuration Supabase manquante (URL ou clé API)"
				);
			}

			// Construction correcte de l'URL avec les paramètres de requête
			const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Appointment?id=eq.${id}`;

			console.log(
				`Annulation du rendez-vous ${id} - envoi direct à ${URL_ENDPOINT}`
			);

			// Récupérer les détails du rendez-vous
			const { data: appointment, error: fetchError } = await supabase
				.from("Appointment")
				.select("*")
				.eq("id", id)
				.single();

			if (fetchError || !appointment) {
				throw new Error(
					`Erreur lors de la récupération du rendez-vous avec l'ID ${id}: ${fetchError?.message}`
				);
			}

			// Simplifier le payload - UNIQUEMENT le statut et updatedAt
			const updatePayload = {
				id: appointment.id,
				date: appointment.date, // important, NOT NULL
				reason: appointment.reason || "", // ou null si autorisé
				patientId: appointment.patientId,
				status: "CANCELED", // statut d’annulation
				notificationSent: appointment.notificationSent || false,
				cabinetId: appointment.cabinetId,
				createdAt: appointment.createdAt,
				updatedAt: new Date().toISOString(), // mise à jour
				user_id: appointment.user_id,
				notes: appointment.notes || "",
			};

			console.log("Payload d'annulation simplifié:", updatePayload);

			// Utiliser PUT au lieu de PATCH pour la compatibilité CORS
			const res = await fetch(URL_ENDPOINT, {
				method: "PUT",
				headers: {
					apikey: SUPABASE_API_KEY,
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					Prefer: "return=representation",
					"X-Cancellation-Override": "true", // En-tête critique pour contourner la vérification de conflit
					...corsHeaders,
				},
				body: JSON.stringify(updatePayload),
			});

			if (!res.ok) {
				const errorText = await res.text();
				console.error(
					"Erreur HTTP lors de l'annulation:",
					res.status,
					errorText
				);
				throw new Error(
					`Erreur lors de l'annulation du rendez-vous: ${res.status}`
				);
			}

			// Traitement de la réponse
			const data = await res.json();
			console.log("Réponse d'annulation:", data);
			if (Array.isArray(data) && data.length > 0) return data[0];
			if (data && typeof data === "object") return data as Appointment;
			throw new Error(
				"Aucune donnée retournée lors de l'annulation du rendez-vous"
			);
		} catch (error) {
			console.error("[SUPABASE ERROR]", error);
			throw error;
		}
	},

	async deleteAppointment(id: number): Promise<boolean> {
		try {
			console.log(`Suppression du rendez-vous ${id}`);
			const { error } = await supabase
				.from("Appointment")
				.delete()
				.eq("id", id);

			if (error) {
				console.error("[SUPABASE ERROR]", error.code, error.message);
				throw error;
			}
			console.log(`Rendez-vous ${id} supprimé avec succès`);
			return true;
		} catch (error: any) {
			console.error("Error deleting appointment:", error);
			throw error;
		}
	},
};
