/**
 * 🏥 Service Patient - Routage simple Supabase vs LocalHDS
 * 
 * Mode démo : Tout vers Supabase éphémère
 * Mode connecté : Patients HDS vers stockage local obligatoire
 */

import { Patient } from '@/types';
import { StorageRouter } from '@/services/storage-router/storage-router';

// Import dynamique des services selon le routage
let demoContext: any = null;

export const setDemoContext = (context: any): void => {
  demoContext = context;
};

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const decision = StorageRouter.route('patients');
    console.log(`📍 Route patients: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      // Mode démo ou fallback : utiliser Supabase
      if (demoContext?.patientService) {
        return demoContext.patientService.getPatients();
      }
      
      // Import dynamique Supabase
      const supabaseService = await import('@/services/supabase-api/patient-service');
      return supabaseService.patientService.getPatients();
    } else {
      // Mode connecté : utiliser LocalHDS
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      return hdsPatientService.getPatients();
    }
  },

  async getPatientById(id: number): Promise<Patient> {
    const decision = StorageRouter.route('patients');
    console.log(`📍 Route patient by ID: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.patientService) {
        return demoContext.patientService.getPatientById(id);
      }
      
      const { patientService: supabaseService } = await import('@/services/supabase-api/patient-service');
      return supabaseService.getPatientById(id);
    } else {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      return hdsPatientService.getPatientById(id);
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const decision = StorageRouter.route('patients');
    console.log(`📍 Route create patient: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.patientService) {
        return demoContext.patientService.createPatient(patient);
      }
      
      const { patientService: supabaseService } = await import('@/services/supabase-api/patient-service');
      return supabaseService.createPatient(patient);
    } else {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      return hdsPatientService.createPatient(patient);
    }
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    const decision = StorageRouter.route('patients');
    console.log(`📍 Route update patient: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.patientService) {
        return demoContext.patientService.updatePatient(patient);
      }
      
      const { patientService: supabaseService } = await import('@/services/supabase-api/patient-service');
      return supabaseService.updatePatient(patient);
    } else {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      return hdsPatientService.updatePatient(patient);
    }
  },

  async deletePatient(id: number): Promise<boolean> {
    const decision = StorageRouter.route('patients');
    console.log(`📍 Route delete patient: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.patientService) {
        return demoContext.patientService.deletePatient(id);
      }
      
      const { patientService: supabaseService } = await import('@/services/supabase-api/patient-service');
      return supabaseService.deletePatient(id);
    } else {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      return hdsPatientService.deletePatient(id);
    }
  },

  async getPatientsByOsteopath(osteopathId: number): Promise<Patient[]> {
    const decision = StorageRouter.route('patients');
    console.log(`📍 Route patients by osteopath: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.patientService) {
        // Le service démo n'a pas cette méthode, utiliser getPatients et filtrer
        const allPatients = await demoContext.patientService.getPatients();
        return allPatients.filter((p: Patient) => p.osteopathId === osteopathId);
      }
      
      const { patientService: supabaseService } = await import('@/services/supabase-api/patient-service');
      return supabaseService.getPatients(); // Supabase filtre déjà par ostéopathe connecté
    } else {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      const allPatients = await hdsPatientService.getPatients();
      return allPatients.filter(p => p.osteopathId === osteopathId);
    }
  }
};

export default patientService;