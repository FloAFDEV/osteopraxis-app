import { Appointment, AppointmentStatus } from "@/types";
import { delay } from "./config";
import { storageRouter } from '../storage/storage-router';
import { XSSProtection } from "@/services/security/xss-protection";

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

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const adapter = await storageRouter.route<Appointment>('appointments');
      await delay(200); // Simulation UI
      return await adapter.getAll();
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'PIN_SETUP_REQUIRED' || error.message === 'PIN_UNLOCK_REQUIRED')) {
        throw error;
      }
      console.error('❌ Erreur récupération rendez-vous:', error);
      return [];
    }
  },

  async getAppointmentById(id: number | string): Promise<Appointment | undefined> {
    // Support UUID en mode démo et number en mode connecté
    if (!id || (typeof id === 'number' && (isNaN(id) || id <= 0))) {
      console.warn('ID rendez-vous invalide:', id);
      return undefined;
    }

    try {
      const adapter = await storageRouter.route<Appointment>('appointments');
      const appointment = await adapter.getById(id);
      return appointment || undefined;
    } catch (error) {
      console.error('❌ Erreur récupération rendez-vous:', error);
      return undefined;
    }
  },
  
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    if (!patientId || isNaN(patientId) || patientId <= 0) {
      console.warn('ID patient invalide:', patientId);
      return [];
    }

    try {
      const allAppointments = await this.getAppointments();
      return allAppointments.filter(a => a.patientId === patientId);
    } catch (error) {
      console.error('❌ Erreur récupération rendez-vous par patient:', error);
      return [];
    }
  },
  
  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    if (!patientId || isNaN(patientId) || patientId <= 0) {
      console.warn('ID patient invalide:', patientId);
      return null;
    }

    try {
      const allAppointments = await this.getAppointments();
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const todayAppointment = allAppointments.find(appointment => {
        if (appointment.patientId !== patientId) return false;
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
      });
      
      return todayAppointment || null;
    } catch (error) {
      console.error('❌ Erreur récupération rendez-vous du jour:', error);
      return null;
    }
  },

  async createAppointment(appointmentData: any): Promise<Appointment> {
    try {
      // Sanitize inputs
      const sanitized = {
        ...appointmentData,
        reason: XSSProtection.sanitizeString(appointmentData?.reason),
        notes: XSSProtection.sanitizeString(appointmentData?.notes),
      };

      const adapter = await storageRouter.route<Appointment>('appointments');
      return await adapter.create(sanitized);
    } catch (error) {
      console.error('❌ Erreur création rendez-vous:', error);
      throw error;
    }
  },

  async updateAppointment(id: number | string, update: Partial<Appointment>): Promise<Appointment> {
    // Support UUID en mode démo et number en mode connecté
    if (!id || (typeof id === 'number' && (isNaN(id) || id <= 0))) {
      throw new Error("ID rendez-vous invalide pour la mise à jour");
    }

    try {
      const sanitizedUpdate: Partial<Appointment> = {
        ...update,
        reason: update.reason ? XSSProtection.sanitizeString(update.reason) : update.reason,
        notes: update.notes ? XSSProtection.sanitizeString(update.notes as any) : update.notes,
      };

      const adapter = await storageRouter.route<Appointment>('appointments');
      return await adapter.update(id, sanitizedUpdate);
    } catch (error) {
      console.error('❌ Erreur mise à jour rendez-vous:', error);
      throw error;
    }
  },
  
  async updateAppointmentStatus(id: number | string, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status });
  },

  async cancelAppointment(id: number | string): Promise<Appointment> {
    return this.updateAppointment(id, { status: "CANCELED" });
  },

  async deleteAppointment(id: number | string): Promise<boolean> {
    // Support UUID en mode démo et number en mode connecté
    if (!id || (typeof id === 'number' && (isNaN(id) || id <= 0))) {
      console.warn('ID rendez-vous invalide pour suppression:', id);
      return false;
    }

    try {
      const adapter = await storageRouter.route<Appointment>('appointments');
      return await adapter.delete(id);
    } catch (error) {
      console.error('❌ Erreur suppression rendez-vous:', error);
      return false;
    }
  }
};