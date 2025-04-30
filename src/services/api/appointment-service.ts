
import { Appointment, AppointmentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { convertLocalToUTC, convertUTCToLocal } from "@/utils/date-utils";
import { supabase } from "@/integrations/supabase/client";

// Type guard pour vérifier si une valeur est une Date
function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// Function to normalize status
function normalizeStatus(status?: string): AppointmentStatus {
  if (status?.toUpperCase() === 'CANCELLED') return "CANCELED";
  return (status as AppointmentStatus) ?? "SCHEDULED";
}

// Type pour la création d'un rendez-vous sans les champs générés
type CreateAppointmentInput = Omit<Appointment, 'id' | 'notificationSent' | 'createdAt' | 'updatedAt'> & {
  notificationSent?: boolean;
};

// Error class for appointment conflicts
export class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentConflictError';
  }
}

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        const appointments = await supabaseAppointmentService.getAppointments();
        // Pas besoin de convertir ici car on veut garder le format ISO pour les dates
        return appointments;
      } catch (error) {
        console.error("Erreur Supabase getAppointments:", error);
        throw error;
      }
    }
    
    // Mock: return empty array instead of undefined
    await delay(300);
    return [];
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentById(id);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        throw error;
      }
    }
    
    // Mock: return a minimal mock appointment instead of undefined
    await delay(200);
    return {
      id,
      date: new Date().toISOString(),
      patientId: 1,
      status: "SCHEDULED",
      reason: "Mock appointment",
      notificationSent: false
    } as Appointment;
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentsByPatientId:", error);
        throw error;
      }
    }
    
    await delay(300);
    return [];
  },

  async createAppointment(appointment: CreateAppointmentInput): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Convertir la date locale en UTC pour le stockage
        const payload = {
          ...appointment,
          notificationSent: appointment.notificationSent ?? false,
          status: normalizeStatus(appointment.status),
          // Conversion explicite de la date locale en UTC
          date: isDate(appointment.date) 
            ? convertLocalToUTC(appointment.date) 
            : appointment.date
        };
        
        // Pas besoin d'inclure createdAt/updatedAt car ils seront gérés par la DB
        delete (payload as any).createdAt;
        delete (payload as any).updatedAt;
        
        return await supabaseAppointmentService.createAppointment(payload);
      } catch (error: any) {
        if (error.message?.includes('Un rendez-vous existe déjà sur ce créneau horaire')) {
          throw new AppointmentConflictError('Ce créneau horaire est déjà réservé');
        }
        console.error("Erreur Supabase createAppointment:", error);
        throw error;
      }
    }
    
    // Mock: return a complete mock appointment
    await delay(400);
    const now = new Date().toISOString();
    return {
      ...appointment,
      id: Math.floor(Math.random() * 1000),
      date: isDate(appointment.date) ? convertLocalToUTC(appointment.date) : appointment.date,
      notificationSent: appointment.notificationSent ?? false,
      status: normalizeStatus(appointment.status),
      createdAt: now,
      updatedAt: now
    } as Appointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        // Convertir la date locale en UTC pour le stockage
        const payload: Partial<Appointment> = { ...appointment };
        
        if (appointment.date) {
          payload.date = isDate(appointment.date) 
            ? convertLocalToUTC(appointment.date) 
            : appointment.date;
        }
        
        if (appointment.status) {
          payload.status = normalizeStatus(appointment.status);
        }
        
        // Ne pas inclure ces champs car ils sont gérés automatiquement par la DB
        delete (payload as any).createdAt;
        delete (payload as any).updatedAt;
          
        return await supabaseAppointmentService.updateAppointment(id, payload);
      } catch (error: any) {
        if (error.message?.includes('Un rendez-vous existe déjà sur ce créneau horaire')) {
          throw new AppointmentConflictError('Ce créneau horaire est déjà réservé');
        }
        console.error("Erreur Supabase updateAppointment:", error);
        throw error;
      }
    }
    
    // Mock: return updated appointment data
    await delay(300);
    const now = new Date().toISOString();
    return {
      ...appointment,
      id,
      date: isDate(appointment.date) 
        ? convertLocalToUTC(appointment.date) 
        : appointment.date,
      status: appointment.status ? normalizeStatus(appointment.status) : "SCHEDULED",
      updatedAt: now
    } as Appointment;
  },

  // Méthode spécifique pour annuler un rendez-vous
  async cancelAppointment(id: number): Promise<Appointment> {
    console.log(`Annulation du rendez-vous ${id}`);
    
    if (USE_SUPABASE) {
      try {
        // Utilisons la méthode du supabaseAppointmentService qui a été améliorée pour ne pas envoyer la date
        return await supabaseAppointmentService.cancelAppointment(id);
      } catch (error) {
        console.error("Erreur Supabase cancelAppointment:", error);
        throw error;
      }
    }
    
    // Mock: return updated appointment data with CANCELED status
    await delay(300);
    
    // Pour les tests en mode mock, créer un rendez-vous complet avec date
    const mockedAppointment: Appointment = {
      id,
      status: "CANCELED",
      date: new Date().toISOString(),
      patientId: 1,
      reason: "Cancelled appointment",
      notificationSent: false
    };
    return mockedAppointment;
  },

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status: normalizeStatus(status) });
  },
  
  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.deleteAppointment(id);
      } catch (error) {
        console.error("Erreur Supabase deleteAppointment:", error);
        throw error;
      }
    }
    
    await delay(300);
    return true;
  }
};
