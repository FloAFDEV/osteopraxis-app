import { Patient } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabasePatientService } from "../supabase-api/patient-service";
import { getCurrentOsteopathId } from "../supabase-api/utils/getCurrentOsteopath";

// Hook pour accéder au contexte démo depuis les services
let demoContext: any = null;
export const setDemoContext = (context: any) => {
  demoContext = context;
};

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Filtrage des données Patient pour ne montrer que les données démo');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      await delay(200);
      return demoLocalStorage.getPatients();
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      await delay(300);
      return [...demoContext.demoData.patients];
    }

    // Utilisateur connecté: stockage HDS local obligatoire
    if (USE_SUPABASE) {
      // Mode connecté: utiliser le service HDS local dédié
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      console.log('👤 Mode connecté: Récupération patients depuis stockage HDS local');
      return await hdsPatientService.getPatients();
    }

    return [];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn('ID patient invalide:', id);
      return undefined;
    }

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Recherche patient ID', id);
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      if (!demoLocalStorage.isSessionActive()) {
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      const patients = demoLocalStorage.getPatients();
      return patients.find(p => p.id === id);
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.patients.find((p: Patient) => p.id === id);
    }

    // Utilisateur connecté: stockage HDS local obligatoire
    if (USE_SUPABASE) {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      console.log('👤 Mode connecté: Recherche patient ID', id, 'dans stockage HDS local');
      return await hdsPatientService.getPatientById(id) || undefined;
    }

    return undefined;
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Création patient');
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      if (!demoLocalStorage.isSessionActive()) {
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      // Mode démo : créer un patient temporaire
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      const newPatient = {
        ...patient,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Patient;
      
      const patients = demoLocalStorage.getPatients();
      patients.push(newPatient);
      return newPatient;
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      const newId = Math.max(...demoContext.demoData.patients.map((p: Patient) => p.id), 0) + 1;
      const newPatient = {
        ...patient,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Patient;
      
      demoContext.demoData.patients.push(newPatient);
      return newPatient;
    }

    // Utilisateur connecté: stockage HDS local obligatoire
    if (USE_SUPABASE) {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      console.log('👤 Mode connecté: Création patient dans stockage HDS local');
      return await hdsPatientService.createPatient(patient);
    }

    throw new Error('❌ Service patient indisponible');
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    if (!patient.id || isNaN(patient.id) || patient.id <= 0) {
      throw new Error("ID patient invalide pour la mise à jour");
    }

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Mise à jour patient ID', patient.id);
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      if (!demoLocalStorage.isSessionActive()) {
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      // Mode démo : mise à jour temporaire
      const updatedPatient = {
        ...patient,
        updatedAt: new Date().toISOString()
      };
      return updatedPatient;
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      const index = demoContext.demoData.patients.findIndex((p: Patient) => p.id === patient.id);
      if (index !== -1) {
        const updatedPatient = {
          ...patient,
          updatedAt: new Date().toISOString()
        };
        demoContext.demoData.patients[index] = updatedPatient;
        return updatedPatient;
      }
      throw new Error('Patient non trouvé en mode démo');
    }

    // Utilisateur connecté: stockage HDS local obligatoire
    if (USE_SUPABASE) {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      console.log('👤 Mode connecté: Mise à jour patient ID', patient.id, 'dans stockage HDS local');
      return await hdsPatientService.updatePatient(patient);
    }

    throw new Error('❌ Service patient indisponible');
  },

  async deletePatient(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn('ID patient invalide pour suppression:', id);
      return false;
    }

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Suppression patient ID', id);
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      if (!demoLocalStorage.isSessionActive()) {
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      // Mode démo : suppression temporaire (simulation)
      return true;
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      const index = demoContext.demoData.patients.findIndex((p: Patient) => p.id === id);
      if (index !== -1) {
        demoContext.demoData.patients.splice(index, 1);
        return true;
      }
      return false;
    }

    // Utilisateur connecté: stockage HDS local obligatoire
    if (USE_SUPABASE) {
      const { hdsPatientService } = await import('@/services/hds-local-storage');
      console.log('👤 Mode connecté: Suppression patient ID', id, 'du stockage HDS local');
      return await hdsPatientService.deletePatient(id);
    }

    return false;
  },

  async getPatientsByOsteopath(osteopathId: number): Promise<Patient[]> {
    // Récupérer tous les patients puis filtrer par ostéopathe
    const allPatients = await this.getPatients();
    return allPatients.filter(patient => patient.osteopathId === osteopathId);
  },

  setDemoContext
};