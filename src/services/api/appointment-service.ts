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
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.getAppointments();
    } else {
      // Mode connecté : utiliser LocalHDS
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.getAppointments();
    }
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route appointment by ID: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.getAppointmentById(id);
      }
      
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.getAppointmentById(id);
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
      
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.createAppointment(appointment);
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
      
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.updateAppointment(appointment);
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      return hdsAppointmentService.updateAppointment(appointment);
    }
  },

  async deleteAppointment(id: number): Promise<boolean> {
    const decision = StorageRouter.route('appointments');
    console.log(`📍 Route delete appointment: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.appointmentService) {
        return demoContext.appointmentService.deleteAppointment(id);
      }
      
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.deleteAppointment(id);
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
      
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.getAppointmentsByPatient(patientId);
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
      
      const { appointmentService: supabaseService } = await import('@/services/supabase-api/appointment-service');
      return supabaseService.getAppointments(); // Supabase filtre déjà par ostéopathe
    } else {
      const { hdsAppointmentService } = await import('@/services/hds-local-storage');
      const allAppointments = await hdsAppointmentService.getAppointments();
      return allAppointments.filter(a => a.osteopathId === osteopathId);
    }
  }
};

export default appointmentService;