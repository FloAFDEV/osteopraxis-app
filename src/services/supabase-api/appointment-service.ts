
import { Appointment, AppointmentStatus } from "@/types";
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";

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

// Fonction pour normaliser les status (si jamais "CANCELLED" est reçu d'anciennes données)
function normalizeStatus(status?: string): AppointmentStatus {
  if (status?.toUpperCase() === 'CANCELLED') return "CANCELED";
  return (status as AppointmentStatus) ?? "SCHEDULED";
}

export const supabaseAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      console.log("Chargement des rendez-vous depuis Supabase");
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .order('date', { ascending: true });
      
      if (error) {
        console.error("Erreur de chargement des rendez-vous:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} rendez-vous chargés`);
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

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .eq("patientId", patientId)
        .order('date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      throw error;
    }
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      console.log("Création d'un nouveau rendez-vous:", payload);
      
      // Création de l'objet à insérer - sans les champs timestamp qui sont auto-générés par la DB
      const insertable: InsertableAppointment = {
        date: payload.date,
        patientId: payload.patientId,
        reason: payload.reason,
        cabinetId: payload.cabinetId,
        status: normalizeStatus(payload.status),
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

  async updateAppointment(id: number, update: UpdateAppointmentPayload): Promise<Appointment> {
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
        throw new Error("Configuration Supabase manquante (URL ou clé API)");
      }
      
      const PATCH_URL = `${SUPABASE_API_URL}/rest/v1/Appointment?id=eq.${id}`;

      // 3. Préparer le payload (nettoyage undefined)
      const updatePayload = {
        ...update,
        status: update.status ? normalizeStatus(update.status) : undefined,
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
          "X-Cancellation-Override": "true"
        };
      }

      console.log("En-têtes de la requête:", {
        ...corsHeaders,
        ...extraHeaders
      });
      
      // 5. Utiliser PATCH au lieu de PUT - Changement critique ici
      const res = await fetch(PATCH_URL, {
        method: "PATCH", // Utiliser PATCH au lieu de PUT
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
          ...corsHeaders,
          ...extraHeaders
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Erreur HTTP ${res.status}:`, errText);
        throw new Error(
          `Erreur HTTP ${res.status}: ${errText}`
        );
      }

      // La réponse est toujours un array d'1 element via PostgREST
      const data = await res.json();
      console.log("Réponse de Supabase:", data);
      
      if (Array.isArray(data) && data.length > 0) return data[0];
      // fallback : parfois selon Prefer/headers c'est un objet direct
      if (data && typeof data === "object") return data as Appointment;
      throw new Error("Aucune donnée retournée lors de la modification du rendez-vous");
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
        throw new Error("Configuration Supabase manquante (URL ou clé API)");
      }
      
      // Construction correcte de l'URL avec les paramètres de requête
      const PATCH_URL = `${SUPABASE_API_URL}/rest/v1/Appointment?id=eq.${id}`;
      
      console.log(`Annulation du rendez-vous ${id} - envoi direct à ${PATCH_URL}`);
      
      // Simplifier le payload - UNIQUEMENT le statut et updatedAt
      const updatePayload = {
        status: "CANCELED",
        updatedAt: new Date().toISOString()
      };

      console.log("Payload d'annulation simplifié:", updatePayload);

      // Utiliser PATCH au lieu de PUT - Changement critique ici
      const res = await fetch(PATCH_URL, {
        method: "PATCH", // Utiliser PATCH au lieu de PUT
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
          "X-Cancellation-Override": "true", // En-tête critique pour contourner la vérification de conflit
          ...corsHeaders
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur HTTP lors de l'annulation:", res.status, errorText);
        throw new Error(`Erreur lors de l'annulation du rendez-vous: ${res.status}`);
      }

      // Traitement de la réponse
      const data = await res.json();
      console.log("Réponse d'annulation:", data);
      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === "object") return data as Appointment;
      throw new Error("Aucune donnée retournée lors de l'annulation du rendez-vous");
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
  }
};
