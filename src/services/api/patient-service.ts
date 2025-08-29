import { Patient } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabasePatientService } from "../supabase-api/patient-service";
import { getCurrentOsteopathId } from "../supabase-api/utils/getCurrentOsteopath";
import { hybridDataManager } from "@/services/hybrid-data-adapter/hybrid-manager";

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

    // Utilisateur connecté: UNIQUEMENT stockage hybride HDS
    if (USE_SUPABASE) {
      return await hybridDataManager.get<Patient>('patients');
    }

    return [];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("getPatientById appelé avec un ID invalide:", id);
      return undefined;
    }

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      await delay(150);
      return demoLocalStorage.getPatientById(id);
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      await delay(200);
      return demoContext.demoData.patients.find((patient: any) => patient.id === id);
    }

    // Utilisateur connecté: UNIQUEMENT stockage hybride HDS
    if (USE_SUPABASE) {
      const res = await hybridDataManager.getById<Patient>('patients', id);
      return res || undefined;
    }

    return undefined;
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Création patient en session démo locale');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      await delay(200);
      
      // S'assurer qu'une session démo existe avant d'ajouter un patient
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      // Assurer les valeurs par défaut pour le mode démo
      const demoPatientData = {
        ...patient,
        osteopathId: 999, // ID factice pour le mode démo
        cabinetId: patient.cabinetId || 1, // Cabinet démo par défaut
        hasVisionCorrection: patient.hasVisionCorrection ?? false,
        isDeceased: patient.isDeceased ?? false,
        isSmoker: patient.isSmoker ?? false
      };
      
      return demoLocalStorage.addPatient(demoPatientData);
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      await delay(200);
      const now = new Date().toISOString();
      const nextId = Math.max(0, ...demoContext.demoData.patients.map((p: Patient) => p.id)) + 1;
      const toCreate: Patient = {
        ...patient,
        id: nextId,
        createdAt: now,
        updatedAt: now,
        osteopathId: (patient as any).osteopathId ?? demoContext.demoData.osteopath.id,
        cabinetId: (patient as any).cabinetId ?? demoContext.demoData.cabinets[0]?.id ?? null,
      } as Patient;
      demoContext.addDemoPatient({ ...(toCreate as any), id: undefined });
      return toCreate;
    }

    // Utilisateur connecté: UNIQUEMENT stockage hybride HDS
    if (USE_SUPABASE) {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
      }
      
      const securedPatientData = {
        ...patient,
        osteopathId,
        cabinetId: patient.cabinetId || null,
      } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
      
      return await hybridDataManager.create<Patient>('patients', securedPatientData);
    }

    throw new Error("❌ Service patient indisponible");
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    if (!patient.id || isNaN(patient.id) || patient.id <= 0) {
      throw new Error("ID patient invalide pour la mise à jour");
    }

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mise à jour patient en session démo locale');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      await delay(150);
      return demoLocalStorage.updatePatient(patient.id, patient);
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      await delay(150);
      demoContext.updateDemoPatient(patient.id, { ...patient, updatedAt: new Date().toISOString() });
      const updated = demoContext.demoData.patients.find((p: Patient) => p.id === patient.id);
      if (!updated) throw new Error(`Patient with id ${patient.id} not found`);
      return updated;
    }

    // Utilisateur connecté: UNIQUEMENT stockage hybride HDS
    if (USE_SUPABASE) {
      return await hybridDataManager.update<Patient>('patients', patient.id, patient);
    }

    throw new Error("Service patient indisponible");
  },

  async deletePatient(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("deletePatient appelé avec un ID invalide:", id);
      return false;
    }

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Suppression patient en session démo locale');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      await delay(120);
      return demoLocalStorage.deletePatient(id);
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      await delay(120);
      if (demoContext.deleteDemoPatient) {
        demoContext.deleteDemoPatient(id);
      } else {
        const idx = demoContext.demoData.patients.findIndex((p: Patient) => p.id === id);
        if (idx !== -1) demoContext.demoData.patients.splice(idx, 1);
      }
      return true;
    }

    // Utilisateur connecté: UNIQUEMENT stockage hybride HDS
    if (USE_SUPABASE) {
      return await hybridDataManager.delete('patients', id);
    }

    return false;
  },

  // Méthode pour injecter le contexte démo
  setDemoContext,
};
