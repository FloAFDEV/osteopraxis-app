
import { Appointment, AppointmentStatus, SupabaseAppointmentStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { 
  addAuthHeaders, 
  ensureAppointmentStatus,
  appointmentStatusMap,
  checkAuth
} from "./utils";

export const supabaseAppointmentService = {
  // Convertit le statut de notre format à celui de Supabase
  toSupabaseStatus(status: AppointmentStatus): SupabaseAppointmentStatus {
    console.log(`Conversion du statut: ${status} vers format Supabase`);
    if (status === 'CANCELLED') {
      return 'CANCELED' as SupabaseAppointmentStatus;
    }
    return status as SupabaseAppointmentStatus;
  },

  // Convertit le statut du format de Supabase au notre
  fromSupabaseStatus(status: string): AppointmentStatus {
    console.log(`Conversion du statut Supabase: ${status} vers notre format`);
    if (status === 'CANCELED') {
      return 'CANCELLED' as AppointmentStatus;
    }
    return status as AppointmentStatus;
  },

  async getAppointments(): Promise<Appointment[]> {
    try {
      console.log("Tentative de récupération des rendez-vous...");
      
      // Vérification de l'authentification
      try {
        const session = await checkAuth();
        console.log("Session active:", !!session, "User ID:", session?.user?.id);
      } catch (authError) {
        console.error("Erreur d'authentification:", authError);
      }
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .order('date', { ascending: true })
      );
      
      console.log("Requête préparée pour getAppointments");
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur SQL getAppointments:", error.code, error.message, error.details, error.hint);
        throw new Error(error.message);
      }
      
      console.log(`Rendez-vous récupérés avec succès: ${data?.length || 0}`);
      
      if (!data) return [];
      
      // Transform data with proper typing
      return data.map(item => ({
        id: item.id,
        date: item.date,
        reason: item.reason,
        patientId: item.patientId,
        status: this.fromSupabaseStatus(item.status),
        notificationSent: item.notificationSent
      }));
    } catch (error) {
      console.error("Erreur getAppointments:", error);
      throw error;
    }
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    try {
      console.log(`Tentative de récupération du rendez-vous ${id}...`);
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .eq("id", id)
          .maybeSingle()
      );
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur SQL getAppointmentById:", error.code, error.message, error.details, error.hint);
        if (error.code === "PGRST116") {
          return undefined;
        }
        throw new Error(error.message);
      }
      
      if (!data) {
        console.log(`Rendez-vous ${id} non trouvé`);
        return undefined;
      }
      
      console.log(`Rendez-vous ${id} récupéré avec succès`);
      
      // Transform data with proper typing
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: this.fromSupabaseStatus(data.status),
        notificationSent: data.notificationSent
      };
    } catch (error) {
      console.error("Erreur getAppointmentById:", error);
      throw error;
    }
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .select("*")
          .eq("patientId", patientId)
          .order('date', { ascending: true })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      if (!data) return [];
      
      // Transform data with proper typing
      return data.map(item => ({
        id: item.id,
        date: item.date,
        reason: item.reason,
        patientId: item.patientId,
        status: this.fromSupabaseStatus(item.status),
        notificationSent: item.notificationSent
      }));
    } catch (error) {
      console.error("Erreur getAppointmentsByPatientId:", error);
      throw error;
    }
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      console.log("Tentative de création d'un rendez-vous:", appointmentData);
      
      // Vérification de l'authentification
      try {
        const session = await checkAuth();
        console.log("Session active pour création:", !!session, "User ID:", session?.user?.id);
      } catch (authError) {
        console.error("Erreur d'authentification lors de la création:", authError);
      }
      
      // Convertir le statut pour Supabase
      const supabaseStatus = this.toSupabaseStatus(appointmentData.status);
      
      // Create appointment with proper status type
      const appointmentToCreate = {
        date: appointmentData.date,
        reason: appointmentData.reason,
        patientId: appointmentData.patientId,
        status: supabaseStatus,
        notificationSent: appointmentData.notificationSent
      };
      
      console.log("Données formatées pour la création:", appointmentToCreate);
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .insert(appointmentToCreate)
          .select()
          .single()
      );
      
      console.log("Requête préparée pour createAppointment");
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur SQL createAppointment:", error.code, error.message, error.details, error.hint);
        throw new Error(error.message);
      }
      
      console.log("Rendez-vous créé avec succès:", data);
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: this.fromSupabaseStatus(data.status),
        notificationSent: data.notificationSent
      };
    } catch (error) {
      console.error("Erreur createAppointment:", error);
      throw error;
    }
  },

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    try {
      console.log(`Tentative de mise à jour du rendez-vous ${id}:`, appointmentData);
      
      // Vérification de l'authentification
      try {
        const session = await checkAuth();
        console.log("Session active pour mise à jour:", !!session, "User ID:", session?.user?.id);
      } catch (authError) {
        console.error("Erreur d'authentification lors de la mise à jour:", authError);
      }
      
      // Modification importante: Au lieu d'utiliser PATCH qui cause les problèmes CORS,
      // récupérer d'abord le rendez-vous existant, puis faire un upsert (POST)
      console.log(`Récupération des données actuelles du rendez-vous ${id} avant mise à jour`);
      
      const existingAppointment = await this.getAppointmentById(id);
      if (!existingAppointment) {
        console.error(`Rendez-vous ${id} introuvable pour la mise à jour`);
        throw new Error(`Appointment with ID ${id} not found`);
      }
      
      // Préparation des données à mettre à jour
      const updateData: Record<string, any> = {
        id: id, // Essentiel pour l'upsert
        date: 'date' in appointmentData ? appointmentData.date : existingAppointment.date,
        reason: 'reason' in appointmentData ? appointmentData.reason : existingAppointment.reason,
        patientId: 'patientId' in appointmentData ? appointmentData.patientId : existingAppointment.patientId,
        notificationSent: 'notificationSent' in appointmentData ? appointmentData.notificationSent : existingAppointment.notificationSent
      };
      
      // Gestion spéciale du statut pour la conversion
      if ('status' in appointmentData && appointmentData.status) {
        updateData.status = this.toSupabaseStatus(appointmentData.status);
      } else {
        updateData.status = this.toSupabaseStatus(existingAppointment.status);
      }
      
      console.log("Données formatées pour la mise à jour:", updateData);
      
      // Utilisation de la méthode upsert au lieu de .update pour éviter CORS
      console.log("Utilisation de la méthode .upsert() pour mise à jour");
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .upsert(updateData)
          .select()
          .single()
      );
      
      console.log("Requête préparée pour updateAppointment avec upsert");
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur SQL updateAppointment:", error.code, error.message, error.details, error.hint);
        throw new Error(error.message);
      }
      
      console.log(`Rendez-vous ${id} mis à jour avec succès:`, data);
      
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        patientId: data.patientId,
        status: this.fromSupabaseStatus(data.status),
        notificationSent: data.notificationSent
      };
    } catch (error) {
      console.error("Erreur updateAppointment:", error);
      throw error;
    }
  },
  
  async deleteAppointment(id: number): Promise<boolean> {
    try {
      console.log(`Tentative de suppression du rendez-vous ${id}...`);
      
      // Vérification de l'authentification
      try {
        const session = await checkAuth();
        console.log("Session active pour suppression:", !!session, "User ID:", session?.user?.id);
      } catch (authError) {
        console.error("Erreur d'authentification lors de la suppression:", authError);
      }
      
      const query = addAuthHeaders(
        supabase
          .from("Appointment")
          .delete()
          .eq("id", id)
      );
      
      console.log("Requête préparée pour deleteAppointment");
      const { error } = await query;
      
      if (error) {
        console.error("Erreur SQL deleteAppointment:", error.code, error.message, error.details, error.hint);
        throw new Error(error.message);
      }
      
      console.log(`Rendez-vous ${id} supprimé avec succès`);
      
      return true;
    } catch (error) {
      console.error("Erreur deleteAppointment:", error);
      throw error;
    }
  }
};
