import { Appointment, AppointmentStatus } from "@/types";
import { supabase } from "./utils";

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
      const { data, error } = await supabase
        .from("Appointment")
        .select("*")
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    try {
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
      
      return data;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, update: UpdateAppointmentPayload): Promise<Appointment> {
    // ============ NOUVELLE LOGIQUE PATCH EN POST + X-HTTP-Method-Override ============
    // 1. Récupérer le token d'auth utilisateur
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Utilisateur non authentifié");
    }
    const token = session.access_token;

    // 2. Composez l'URL API
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanV2enBxZmlyeW10anduaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2Mzg4MjIsImV4cCI6MjA0NDIxNDgyMn0.VUmqO5zkRxr1Xucv556GStwCabvZrRckzIzXVPgAthQ";
    const PATCH_URL = `https://jpjuvzpqfirymtjwnier.supabase.co/rest/v1/Appointment?id=eq.${id}`;

    // 3. Préparer le payload (nettoyage undefined)
    const updatePayload = {
      ...update,
      status: update.status ? normalizeStatus(update.status) : undefined,
      updatedAt: new Date().toISOString(),
    };
    Object.keys(updatePayload).forEach(
      (k) =>
        (updatePayload as any)[k] === undefined &&
        delete (updatePayload as any)[k]
    );

    // 4. Appel POST en forçant PATCH + token explicite
    const res = await fetch(PATCH_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "X-HTTP-Method-Override": "PATCH",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Erreur HTTP ${res.status}: ${JSON.stringify(err)}`
      );
    }

    // La réponse est toujours un array d'1 element via PostgREST
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0];
    // fallback : parfois selon Prefer/headers c’est un objet direct
    if (data && typeof data === "object") return data as Appointment;
    throw new Error("Aucune donnée retournée lors de la modification du rendez-vous");
  },

  async deleteAppointment(id: number): Promise<boolean> {
    try {
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
  }
};
