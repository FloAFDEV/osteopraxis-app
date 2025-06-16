
import { Appointment, AppointmentStatus } from "@/types";
import {
	supabase,
	ensureAppointmentStatus,
} from "./utils";
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
	osteopathId?: number;
	notificationSent: boolean;
	notes?: string | null;
};

// Type pour les mises à jour d'appointment
type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export const supabaseAppointmentService = {
	async getAppointments(): Promise<Appointment[]> {
		try {
			console.log("Chargement des rendez-vous depuis Supabase avec RLS");
			
			// Avec RLS activé, nous récupérons directement tous les rendez-vous
			// Les politiques RLS filtreront automatiquement selon l'ostéopathe connecté
			const { data, error } = await supabase
				.from("Appointment")
				.select("*")
				.order("date", { ascending: true });

			if (error) {
				console.error("Erreur de chargement des rendez-vous:", error);
				throw error;
			}

			console.log(`${data?.length || 0} rendez-vous chargés`);
			return (data || []).map(adaptAppointmentFromSupabase);
		} catch (error) {
			console.error("Error fetching appointments:", error);
			throw error;
		}
	},

	async getAppointmentById(id: number): Promise<Appointment> {
		try {
			console.log(`Chargement du rendez-vous ${id}`);
			// RLS s'applique automatiquement
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
			// RLS filtrera automatiquement selon l'ostéopathe connecté
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

			// RLS filtrera automatiquement selon l'ostéopathe connecté
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
			
			// Récupérer l'osteopathId de l'utilisateur connecté
			const osteopathId = await getCurrentOsteopathId();
			
			// Vérifier que le patient appartient bien à l'ostéopathe connecté
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

			// Création de l'objet à insérer avec osteopathId
			const adaptedData = adaptAppointmentToSupabase({
				...payload,
				osteopathId: osteopathId, // Forcer l'osteopathId de l'utilisateur connecté
			});

			console.log("adaptedData:", adaptedData);

			// Convertir le statut si nécessaire (CANCELLED -> CANCELED)
			if (adaptedData.status === "CANCELLED") {
				adaptedData.status = "CANCELED";
			}

			// Nettoyer les valeurs undefined
			const finalData = { ...adaptedData };
			Object.keys(finalData).forEach(key => {
				if (finalData[key] === undefined) {
					delete finalData[key];
				}
			});

			console.log("finalData à insérer:", finalData);

			// Avec RLS, l'insertion se fera automatiquement avec les bonnes vérifications
			const { data, error } = await supabase
				.from("Appointment")
				.insert(finalData)
				.select()
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
			console.log(`Mise à jour du rendez-vous ${id} via Edge Function:`, update);

			// Préparer le payload de mise à jour
			const updatePayload = {
				...update,
				status: update.status ? ensureAppointmentStatus(update.status) : undefined,
			};

			// Supprimer les champs undefined du payload final
			Object.keys(updatePayload).forEach(
				(k) =>
					updatePayload[k] === undefined &&
					delete updatePayload[k]
			);

			console.log("Payload de mise à jour Edge Function:", updatePayload);

			// Récupérer le token d'authentification
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.access_token) {
				throw new Error('No authentication token available');
			}

			// Préparer le body de la requête
			const requestBody = {
				appointmentId: id,
				updateData: updatePayload
			};

			console.log("Request body pour Edge Function:", requestBody);

			// Utiliser l'Edge Function pour la mise à jour
			const { data, error } = await supabase.functions.invoke('update-appointment', {
				body: requestBody,
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (error) {
				console.error("[EDGE FUNCTION ERROR]", error);
				throw error;
			}

			if (!data || !data.success) {
				console.error("[EDGE FUNCTION ERROR]", data?.error || 'Unknown error');
				throw new Error(data?.error || 'Unknown error from Edge Function');
			}

			console.log("Rendez-vous mis à jour via Edge Function:", data.data);
			return adaptAppointmentFromSupabase(data.data);
		} catch (error) {
			console.error("[EDGE FUNCTION ERROR]", error);
			throw error;
		}
	},

	// Méthode spécifique pour annuler un rendez-vous sans modifier l'heure
	async cancelAppointment(id: number): Promise<Appointment> {
		try {
			console.log(`Annulation du rendez-vous ${id}`);

			// Utiliser la méthode updateAppointment qui utilise maintenant l'Edge Function
			return await this.updateAppointment(id, { status: "CANCELED" });
		} catch (error) {
			console.error("[EDGE FUNCTION ERROR]", error);
			throw error;
		}
	},

	async deleteAppointment(id: number): Promise<boolean> {
		try {
			console.log(`Suppression du rendez-vous ${id}`);
			// RLS s'applique automatiquement pour la suppression
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
