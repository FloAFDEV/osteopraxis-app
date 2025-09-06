/**
 * 📅 Service Appointment - Routage simple Supabase vs LocalHDS
 * 
 * Mode démo : Tout vers Supabase éphémère
 * Mode connecté : Appointments HDS vers stockage local obligatoire
 */

import { Appointment } from '@/types';
import { StorageRouter } from '@/services/storage-router/storage-router';

// Import dynamique des services selon le routage
let demoContext: any = null;

export const setDemoContext = (context: any): void => {
  demoContext = context;
};

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
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route appointments: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      // Mode démo ou fallback : utiliser Supabase
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.getAppointments();
      }
      
      // Import dynamique Supabase
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.supabaseAppointmentService.getAppointments();
    } else {
      // Mode connecté : utiliser LocalHDS
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.getAppointments();
    }
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route appointment by ID: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.getAppointmentById(id);
      }
      
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.supabaseAppointmentService.getAppointmentById(id);
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.getAppointmentById(id);
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route create appointment: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.createAppointment(appointment);
      }
      
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.supabaseAppointmentService.createAppointment(appointment);
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.createAppointment(appointment);
    }
  },

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route update appointment: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.updateAppointment(appointment);
      }
      
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.updateAppointment(appointment.id, appointment);
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.updateAppointment(appointment.id, appointment);
    }
  },

  async deleteAppointment(id: number): Promise<boolean> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route delete appointment: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.deleteAppointment(id);
      }
      
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.supabaseAppointmentService.deleteAppointment(id);
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.deleteAppointment(id);
    }
  },

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route appointments by patient: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        const allAppointments = await demoContext.appointmentService.getAppointments();
        return allAppointments.filter((a: Appointment) => a.patientId === patientId);
      }
      
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.supabaseAppointmentService.getAppointmentsByPatientId(patientId);
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      const allAppointments = await hdsAppointmentService.getAppointments();
      return allAppointments.filter(a => a.patientId === patientId);
    }
  },

  async getAppointmentsByOsteopath(osteopathId: number): Promise<Appointment[]> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route appointments by osteopath: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        const allAppointments = await demoContext.appointmentService.getAppointments();
        return allAppointments.filter((a: Appointment) => a.osteopathId === osteopathId);
      }
      
      const supabaseService = await import('@/services/supabase-api/appointment-service');
      return supabaseService.supabaseAppointmentService.getAppointments(); // Supabase filtre déjà par ostéopathe
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      const allAppointments = await hdsAppointmentService.getAppointments();
      return allAppointments.filter(a => a.osteopathId === osteopathId);
    }
  },

  // Méthodes complémentaires pour compatibilité existante
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    return this.getAppointmentsByPatient(patientId);
  },

  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    const appointments = await this.getAppointmentsByPatient(patientId);
    const today = new Date().toISOString().split('T')[0];
    return appointments.find(a => a.date.startsWith(today)) || null;
  },

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = await this.getAppointmentById(id);
    return this.updateAppointment({ ...appointment, status } as Appointment);
  },

  async cancelAppointment(id: number): Promise<Appointment> {
    const appointment = await this.getAppointmentById(id);
    return this.updateAppointment({ ...appointment, status: 'CANCELED' } as Appointment);
  }
};

// Fonctions exportées individuellement pour compatibilité
export const getAppointments = appointmentService.getAppointments;
export const getAppointmentById = appointmentService.getAppointmentById;
export const createAppointment = appointmentService.createAppointment;
export const updateAppointment = appointmentService.updateAppointment;
export const deleteAppointment = appointmentService.deleteAppointment;
export const getAppointmentsByPatient = appointmentService.getAppointmentsByPatient;

export default appointmentService;