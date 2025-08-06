import { Appointment, AppointmentStatus } from "@/types";
import {
	supabase,
	ensureAppointmentStatus,
	SUPABASE_API_URL,
	SUPABASE_API_KEY,
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
			// Vérifier d'abord l'authentification
			const { data: sessionData } = await supabase.auth.getSession();
			if (!sessionData?.session) {
				throw new Error("Non authentifié - aucune session trouvée");
			}
			
			console.log("Session utilisateur trouvée:", sessionData.session.user.id);
			
			// Debug: Tester la fonction get_current_osteopath_id
			try {
				const { data: debugData, error: debugError } = await supabase
					.rpc('get_current_osteopath_id_debug');
				
				console.log("Debug osteopath ID:", debugData);
				if (debugError) {
					console.error("Erreur debug osteopath ID:", debugError);
				}
			} catch (debugErr) {
				console.error("Exception debug osteopath ID:", debugErr);
			}
			
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

			// Avec RLS, l'insertion se fera automatiquement avec les bonnes vérifications
			const { data, error } = await supabase
				.from("Appointment")
				.insert(finalData)
				.select()
				.single();

			if (error) {
				console.error("[SUPABASE ERROR]", error.code, error.message);
				
				// Gérer spécifiquement l'erreur de conflit de créneaux
				if (error.code === "P0001" && error.message.includes("créneau horaire")) {
					// Récupérer les détails du conflit pour une meilleure UX
					const appointmentTime = new Date(payload.date);
					const endTime = new Date(appointmentTime.getTime() + 60 * 60 * 1000);

					const { data: conflictingAppointments } = await supabase
						.from('Appointment')
						.select(`
							id,
							date,
							patientId,
							reason,
							status,
							Patient:patientId (
								id,
								firstName,
								lastName,
								phone,
								email
							)
						`)
						.eq('osteopathId', osteopathId)
						.not('status', 'in', '("CANCELED","NO_SHOW")')
						.gte('date', appointmentTime.toISOString())
						.lt('date', endTime.toISOString());

					if (conflictingAppointments && conflictingAppointments.length > 0) {
						const conflictInfo = {
							conflictingAppointments: conflictingAppointments.map(apt => ({
								id: apt.id,
								date: apt.date,
								patientName: `${apt.Patient?.firstName} ${apt.Patient?.lastName}`,
								patientPhone: apt.Patient?.phone,
								patientEmail: apt.Patient?.email,
								reason: apt.reason,
								status: apt.status
							})),
							requestedDate: payload.date,
							currentDate: new Date().toISOString()
						};

						// Créer une erreur personnalisée avec les informations de conflit
						const conflictError = new Error("Un rendez-vous existe déjà sur ce créneau horaire");
						(conflictError as any).isConflict = true;
						(conflictError as any).conflictInfo = conflictInfo;
						throw conflictError;
					}
				}
				
				throw error;
			}

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
			// Préparer le payload de mise à jour en excluant les champs sensibles
			const updatePayload: Record<string, any> = {};
			
			// Copier seulement les champs autorisés (sans start/end qui n'existent pas dans la DB)
			const allowedFields = ['date', 'patientId', 'reason', 'status', 'cabinetId', 'notificationSent', 'notes'];
			for (const field of allowedFields) {
				if (field in update && update[field as keyof UpdateAppointmentPayload] !== undefined) {
					updatePayload[field] = update[field as keyof UpdateAppointmentPayload];
				}
			}

			// Traiter le statut spécialement
			if (update.status) {
				updatePayload.status = ensureAppointmentStatus(update.status);
			}

			// Récupérer le token d'authentification
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.access_token) {
				throw new Error('No authentication token available');
			}

			// Préparer le body de la requête avec stringify explicite
			const requestData = {
				appointmentId: id,
				updateData: updatePayload
			};

			// Utiliser l'Edge Function pour la mise à jour avec les constantes exportées
			const response = await fetch(`${SUPABASE_API_URL}/functions/v1/update-appointment`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
					'apikey': SUPABASE_API_KEY,
				},
				body: JSON.stringify(requestData)
			});

			const result = await response.json();

			if (!response.ok) {
				// Check if it's a conflict error (409)
				if (response.status === 409 && result.isConflict) {
					// Create a custom error with conflict information
					const conflictError = new Error(result.error || 'Appointment conflict detected');
					(conflictError as any).isConflict = true;
					(conflictError as any).conflictInfo = result.conflictInfo;
					throw conflictError;
				}
				
				console.error('[EDGE FUNCTION HTTP ERROR]', response.status, result);
				throw new Error(result?.error || `Edge Function returned ${response.status}`);
			}

			if (!result || !result.success) {
				console.error("[EDGE FUNCTION ERROR]", result?.error || 'Unknown error');
				throw new Error(result?.error || 'Unknown error from Edge Function');
			}

			return adaptAppointmentFromSupabase(result.data);
		} catch (error) {
			console.error("[APPOINTMENT UPDATE ERROR]", error);
			throw error;
		}
	},

	// Méthode spécifique pour annuler un rendez-vous sans modifier l'heure
	async cancelAppointment(id: number): Promise<Appointment> {
		try {
			// Utiliser la méthode updateAppointment qui utilise maintenant l'Edge Function
			return await this.updateAppointment(id, { status: "CANCELED" });
		} catch (error) {
			console.error("[EDGE FUNCTION ERROR]", error);
			throw error;
		}
	},

	async deleteAppointment(id: number): Promise<boolean> {
		try {
			// RLS s'applique automatiquement pour la suppression
			const { error } = await supabase
				.from("Appointment")
				.delete()
				.eq("id", id);

			if (error) {
				console.error("[SUPABASE ERROR]", error.code, error.message);
				throw error;
			}
			
			return true;
		} catch (error: any) {
			console.error("Error deleting appointment:", error);
			throw error;
		}
	},
};
