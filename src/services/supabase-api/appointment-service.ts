
import { Appointment, AppointmentStatus } from "@/types";
import {
	supabase,
	SUPABASE_API_URL,
	SUPABASE_API_KEY,
	ensureAppointmentStatus,
} from "./utils";
import { corsHeaders } from "@/services/corsHeaders";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";
import { adaptAppointmentFromSupabase, adaptAppointmentToSupabase, createAppointmentPayload } from "./appointment-adapter";

// Type plus spécifique pour la création d'appointment
type CreateAppointmentPayload = {
	date: string;
	patientId: number;
	reason: string;
	start: string;
	end: string;
	status?: AppointmentStatus;
	cabinetId?: number;
	osteopathId?: number;
	notificationSent?: boolean;
	notes?: string | null;
};

// Type pour l'objet réellement envoyé à Supabase
type InsertableAppointment = {
	date: string;
	patientId: number;
	reason: string;
	status: AppointmentStatus;
	cabinetId?: number;
	osteopathId: number;
	notificationSent: boolean;
	notes?: string | null;
};

// Type pour les mises à jour d'appointment
type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export const supabaseAppointmentService = {
	async getAppointments(): Promise<Appointment[]> {
		try {
			console.log("Chargement des rendez-vous depuis Supabase");
			
			// Récupérer l'ID de l'ostéopathe connecté
			const osteopathId = await getCurrentOsteopathId();
			
			// Récupérer les rendez-vous directement par osteopathId
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.eq("osteopathId", osteopathId)
				.order("date", { ascending: true });

			if (error) {
				console.error("Erreur de chargement des rendez-vous:", error);
				throw error;
			}

			console.log(`${data?.length || 0} rendez-vous chargés pour l'ostéopathe ${osteopathId}`);
			return (data || []).map(adaptAppointmentFromSupabase);
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

			return adaptAppointmentFromSupabase(data);
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

			return (data || []).map(adaptAppointmentFromSupabase);
		} catch (error) {
			console.error("Error fetching patient appointments:", error);
			throw error;
		}
	},

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

			return data ? adaptAppointmentFromSupabase(data) : null;
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
			
			// Récupérer l'osteopathId de l'utilisateur connecté pour le forcer dans le payload
			const osteopathId = await getCurrentOsteopathId();
			if (!osteopathId) {
				throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
			}
			
			// Écraser l'osteopathId dans le payload avec celui de l'utilisateur connecté
			payload.osteopathId = osteopathId;
			
			// Utiliser la fonction adaptateur pour créer le payload
			const adaptedData = adaptAppointmentToSupabase(payload);

			// Convertir le statut si nécessaire (CANCELLED -> CANCELED)
			if (adaptedData.status === "CANCELLED") {
				adaptedData.status = "CANCELED";
			}

			console.log("Données adaptées pour insertion:", adaptedData);

			const { data, error } = await supabase
				.from("Appointment")
				.insert(adaptedData)
				.select("*")
				.single();

			if (error) {
				console.error("[SUPABASE ERROR]", error.code, error.message);
				throw error;
			}

			console.log("Rendez-vous créé avec succès:", data);
			return adaptAppointmentFromSupabase(data);
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

			// Préparer le payload (nettoyage undefined)
			const updatePayload = {
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

			const { data, error } = await supabase
				.from("Appointment")
				.update(updatePayload)
				.eq("id", id)
				.select("*")
				.single();

			if (error) {
				console.error("[SUPABASE ERROR]", error);
				throw error;
			}

			return adaptAppointmentFromSupabase(data);
		} catch (error) {
			console.error("[SUPABASE ERROR]", error);
			throw error;
		}
	},

	// Méthode spécifique pour annuler un rendez-vous sans modifier l'heure
	async cancelAppointment(id: number): Promise<Appointment> {
		try {
			console.log(`Annulation du rendez-vous ${id}`);

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
				status: "CANCELED",
				updatedAt: new Date().toISOString(),
			};

			console.log("Payload d'annulation simplifié:", updatePayload);

			const { data, error } = await supabase
				.from("Appointment")
				.update(updatePayload)
				.eq("id", id)
				.select("*")
				.single();

			if (error) {
				console.error("Erreur lors de l'annulation:", error);
				throw error;
			}

			console.log("Réponse d'annulation:", data);
			return adaptAppointmentFromSupabase(data);
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
