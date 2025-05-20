import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { AppointmentStatus, CreateAppointmentPayload } from "@/types"; 
import { createAppointmentPayload } from "../supabase-api/appointment-adapter";
import { getCurrentOsteopathId, isAppointmentOwnedByCurrentOsteopath, isPatientOwnedByCurrentOsteopath } from "@/services";

// Create a custom error class for appointment conflicts
export class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentConflictError";
  }
}

// Security error class for unauthorized access
export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityViolationError";
  }
}

// Mock data (replace with actual data fetching)
const appointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    cabinetId: 1,
    osteopathId: 1,
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
    date: new Date().toISOString(),
    reason: "Consultation de routine",
    status: "SCHEDULED",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationSent: false,
  },
  {
    id: 2,
    patientId: 2,
    cabinetId: 1,
    osteopathId: 1,
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
    date: new Date().toISOString(),
    reason: "Suivi post-opératoire",
    status: "COMPLETED",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationSent: false,
  },
];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        // La méthode supabaseAppointmentService.getAppointments() est déjà
        // filtrée par osteopathId via l'appel à getCurrentOsteopathId()
        return await supabaseAppointmentService.getAppointments();
      } catch (error) {
        console.error("Erreur Supabase getAppointments:", error);
        throw error;
      }
    }

    // Simulation locale filtrée par osteopathId
    await delay(300);
    const osteopathId = 1; // Simulated ID for local testing only
    return appointments.filter(appointment => appointment.osteopathId === osteopathId);
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        // Vérifier que le rendez-vous appartient à l'ostéopathe connecté
        const isOwned = await isAppointmentOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès au rendez-vous ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
        }
        
        return await supabaseAppointmentService.getAppointmentById(id);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        throw error;
      }
    }

    await delay(200);
    return appointments.find((appointment) => appointment.id === id);
  },
  
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        // S'assurer que le patient appartient à l'ostéopathe connecté avant de récupérer ses rendez-vous
        const isOwned = await isPatientOwnedByCurrentOsteopath(patientId);
        
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès aux rendez-vous du patient ${patientId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
        }
        
        return await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentsByPatientId:", error);
        throw error;
      }
    }

    await delay(200);
    return appointments.filter((appointment) => appointment.patientId === patientId);
  },
  
  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    if (USE_SUPABASE) {
      try {
        // S'assurer que le patient appartient à l'ostéopathe connecté
        const { isPatientOwnedByCurrentOsteopath } = await import("@/services");
        const isOwned = await isPatientOwnedByCurrentOsteopath(patientId);
        
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès aux rendez-vous du jour du patient ${patientId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
        }
        
        return await supabaseAppointmentService.getTodayAppointmentForPatient(patientId);
      } catch (error) {
        console.error("Erreur Supabase getTodayAppointmentForPatient:", error);
        throw error;
      }
    }
    
    // Mock implementation for non-Supabase mode
    await delay(200);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return appointments.find(a => 
      a.patientId === patientId && 
      new Date(a.date) >= today && 
      new Date(a.date) < tomorrow
    ) || null;
  },

  async createAppointment(appointmentData: any): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // S'assurer que le patient appartient à l'ostéopathe connecté
        const { isPatientOwnedByCurrentOsteopath } = await import("@/services");
        const isOwned = await isPatientOwnedByCurrentOsteopath(appointmentData.patientId);
        
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de création d'un rendez-vous pour le patient ${appointmentData.patientId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
        }
        
        // Récupérer l'osteopathId de l'utilisateur connecté pour le forcer dans le payload
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        
        // Écraser l'osteopathId dans le payload avec celui de l'utilisateur connecté
        appointmentData.osteopathId = osteopathId;
        
        // Utiliser la fonction adaptateur pour créer le payload
        const payload = createAppointmentPayload(appointmentData);
        return await supabaseAppointmentService.createAppointment(payload);
      } catch (error) {
        console.error("Erreur lors de la création de la séance:", error);
        throw error;
      }
    }
    
    await delay(500);
    // Assurer que tous les champs nécessaires sont présents
    const appointmentWithAllFields = {
      ...appointmentData,
      id: appointments.length + 1,
      start: appointmentData.start || appointmentData.date,
      end: appointmentData.end || new Date(new Date(appointmentData.date).getTime() + 30 * 60000).toISOString(),
      date: appointmentData.date || appointmentData.start,
      osteopathId: appointmentData.osteopathId || 1,
    };
    appointments.push(appointmentWithAllFields);
    return appointmentWithAllFields;
  },

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Vérifier que le rendez-vous appartient à l'ostéopathe connecté
        const isOwned = await isAppointmentOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de mise à jour du rendez-vous ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
        }
        
        // Empêcher la modification de l'osteopathId et du patientId
        if (update.osteopathId !== undefined) {
          console.warn(`[SECURITY] Tentative de modification de l'osteopathId dans updateAppointment. Cette modification sera ignorée.`);
          delete update.osteopathId;
        }
        
        if (update.patientId !== undefined) {
          // Vérifier que le nouveau patient appartient aussi à l'ostéopathe connecté
          const isNewPatientOwned = await isPatientOwnedByCurrentOsteopath(update.patientId);
          if (!isNewPatientOwned) {
            console.error(`[SECURITY VIOLATION] Tentative d'attribution du rendez-vous ${id} au patient ${update.patientId} qui n'appartient pas à l'ostéopathe connecté`);
            throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
          }
        }
        
        return await supabaseAppointmentService.updateAppointment(id, update);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la séance:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...update };
      return appointments[index];
    }
    throw new Error(`Séance avec l'identifiant ${id} non trouvée`);
  },
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    // Cette méthode utilise updateAppointment qui est déjà sécurisée
    return this.updateAppointment(id, { status });
  },
  
  async cancelAppointment(id: number): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Vérifier que le rendez-vous appartient à l'ostéopathe connecté
        const isOwned = await isAppointmentOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'annulation du rendez-vous ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
        }
        
        return await supabaseAppointmentService.cancelAppointment(id);
      } catch (error) {
        console.error("Erreur lors de l'annulation de la séance:", error);
        throw error;
      }
    }
    
    return this.updateAppointment(id, { status: "CANCELED" });
  },

  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        // Vérifier que le rendez-vous appartient à l'ostéopathe connecté
        const isOwned = await isAppointmentOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de suppression du rendez-vous ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
        }
        
        await supabaseAppointmentService.deleteAppointment(id);
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteAppointment:", error);
        throw error;
      }
    }

    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  },
};
