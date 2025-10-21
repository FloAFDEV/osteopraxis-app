import { Patient } from "@/types";
import { delay } from "./config";
import { storageRouter } from '../storage/storage-router';

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    try {
      const adapter = await storageRouter.route<Patient>('patients');
      await delay(200); // Simulation UI
      const result = await adapter.getAll();
      console.log(`📋 PatientService: ${result.length} patients récupérés`);
      return result;
    } catch (error) {
      // Propager les erreurs PIN pour forcer l'affichage du composant approprié
      if (error instanceof Error && 
          (error.message === 'PIN_SETUP_REQUIRED' || error.message === 'PIN_UNLOCK_REQUIRED')) {
        throw error;
      }
      console.error('❌ Erreur récupération patients:', error);
      return [];
    }
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn('ID patient invalide:', id);
      return undefined;
    }

    try {
      const adapter = await storageRouter.route<Patient>('patients');
      const patient = await adapter.getById(id);
      return patient || undefined;
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'PIN_SETUP_REQUIRED' || error.message === 'PIN_UNLOCK_REQUIRED')) {
        throw error;
      }
      console.error('❌ Erreur récupération patient:', error);
      return undefined;
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      const adapter = await storageRouter.route<Patient>('patients');
      return await adapter.create(patient);
    } catch (error) {
      // Propager les erreurs PIN pour forcer l'affichage du composant approprié
      if (error instanceof Error && 
          (error.message === 'PIN_SETUP_REQUIRED' || error.message === 'PIN_UNLOCK_REQUIRED')) {
        throw error;
      }
      console.error('❌ Erreur création patient:', error);
      throw new Error('❌ Service patient indisponible');
    }
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    if (!patient.id || isNaN(patient.id) || patient.id <= 0) {
      throw new Error("ID patient invalide pour la mise à jour");
    }

    try {
      const adapter = await storageRouter.route<Patient>('patients');
      return await adapter.update(patient.id, patient);
    } catch (error) {
      console.error('❌ Erreur mise à jour patient:', error);
      throw new Error('❌ Service patient indisponible');
    }
  },

  async deletePatient(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn('ID patient invalide pour suppression:', id);
      return false;
    }

    try {
      const adapter = await storageRouter.route<Patient>('patients');
      return await adapter.delete(id);
    } catch (error) {
      console.error('❌ Erreur suppression patient:', error);
      return false;
    }
  },

  async getPatientsByOsteopath(osteopathId: number): Promise<Patient[]> {
    // Récupérer tous les patients puis filtrer par ostéopathe
    const allPatients = await this.getPatients();
    return allPatients.filter(patient => patient.osteopathId === osteopathId);
  }
};