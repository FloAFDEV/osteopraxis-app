
import { Appointment, AppointmentStatus } from "@/types";
import { SessionStatus, SessionFormData } from "@/types/session";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";

// Classe pour l'erreur de conflit de session
export class SessionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionConflictError";
  }
}

// Service de gestion des séances (utilise le même backend que les rendez-vous pour l'instant)
export const sessionService = {
  async getSessions(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointments();
      } catch (error) {
        console.error("Erreur Supabase getSessions:", error);
        throw error;
      }
    }

    try {
      const response = await fetch('/api/sessions');
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des séances:", error);
      throw error;
    }
  },

  async getSessionById(id: number): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentById(id);
      } catch (error) {
        console.error("Erreur Supabase getSessionById:", error);
        throw error;
      }
    }

    try {
      const response = await fetch(`/api/sessions/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la séance ${id}:`, error);
      throw error;
    }
  },
  
  async getSessionsByPatientId(patientId: number): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getSessionsByPatientId:", error);
        throw error;
      }
    }

    try {
      const response = await fetch(`/api/patients/${patientId}/sessions`);
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des séances du patient ${patientId}:`, error);
      throw error;
    }
  },

  async createSession(session: Omit<Appointment, "id">): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.createAppointment(session);
      } catch (error) {
        console.error("Erreur lors de la création de la séance:", error);
        throw error;
      }
    }
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de la séance:", error);
      throw error;
    }
  },

  async updateSession(id: number, update: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.updateAppointment(id, update);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la séance:", error);
        throw error;
      }
    }
    
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la séance ${id}:`, error);
      throw error;
    }
  },
  
  async updateSessionStatus(id: number, status: SessionStatus): Promise<Appointment> {
    return this.updateSession(id, { status: status as AppointmentStatus });
  },
  
  async cancelSession(id: number): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.cancelAppointment(id);
      } catch (error) {
        console.error("Erreur lors de l'annulation de la séance:", error);
        throw error;
      }
    }
    
    return this.updateSession(id, { status: "CANCELED" as AppointmentStatus });
  },

  async deleteSession(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        await supabaseAppointmentService.deleteAppointment(id);
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteSession:", error);
        throw error;
      }
    }

    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la séance ${id}:`, error);
      throw error;
    }
  },

  // Méthode pour créer une séance immédiate
  async createImmediateSession(patientId: number, reason: string = "Séance non planifiée"): Promise<Appointment> {
    const now = new Date();
    const sessionData = {
      patientId,
      date: now.toISOString(),
      reason,
      status: "IN_PROGRESS" as AppointmentStatus,
      notificationSent: false,
      notes: ""
    };

    return this.createSession(sessionData);
  },
  
  // Méthode pour auto-sauvegarder une séance
  async autoSaveSession(id: number, data: Partial<Appointment>): Promise<Appointment> {
    console.log(`Auto-sauvegarde de la séance ${id}...`);
    
    // Ajouter un timestamp d'auto-sauvegarde
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.updateSession(id, updateData);
  }
};

export default sessionService;
