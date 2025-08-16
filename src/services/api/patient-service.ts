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
    // Démo: données locales éphémères
    if (demoContext?.isDemoMode) {
      await delay(300);
      return [...demoContext.demoData.patients];
    }

    if (USE_SUPABASE) {
      try {
        // Route via stockage local hybride (HDS)
        return await hybridDataManager.get<Patient>('patients');
      } catch (error) {
        console.error("Erreur Hybrid getPatients:", error);
        // Fallback pour éviter les erreurs bloquantes
        return [];
      }
    }

    // Pas de mode démo et Supabase désactivé
    return [];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("getPatientById appelé avec un ID invalide:", id);
      return undefined;
    }

    // Démo: données locales éphémères
    if (demoContext?.isDemoMode) {
      await delay(200);
      return demoContext.demoData.patients.find((patient: any) => patient.id === id);
    }

    if (USE_SUPABASE) {
      try {
        const res = await hybridDataManager.getById<Patient>('patients', id);
        return res || undefined;
      } catch (error) {
        console.error("Erreur Hybrid getPatientById:", error);
        return undefined;
      }
    }

    // Pas de mode démo et Supabase désactivé
    return undefined;
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Démo: données locales éphémères (pas d'appel Supabase)
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
      // Le provider crée l'id, on lui passe sans id pour respecter le contrat
      demoContext.addDemoPatient({ ...(toCreate as any), id: undefined });
      return toCreate;
    }

    if (USE_SUPABASE) {
      try {
        // Forcer l'osteopathId via service existant puis créer en local
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        const securedPatientData = {
          ...patient,
          osteopathId,
          cabinetId: patient.cabinetId || null,
        } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
        const created = await hybridDataManager.create<Patient>('patients', securedPatientData);
        return created;
      } catch (error) {
        console.error("Erreur Hybrid createPatient:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    throw new Error("Service patient indisponible");
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    if (!patient.id || isNaN(patient.id) || patient.id <= 0) {
      throw new Error("ID patient invalide pour la mise à jour");
    }

    // Démo: mise à jour locale éphémère
    if (demoContext?.isDemoMode) {
      await delay(150);
      demoContext.updateDemoPatient(patient.id, { ...patient, updatedAt: new Date().toISOString() });
      const updated = demoContext.demoData.patients.find((p: Patient) => p.id === patient.id);
      if (!updated) throw new Error(`Patient with id ${patient.id} not found`);
      return updated;
    }

    if (USE_SUPABASE) {
      try {
        const updatedPatient = await hybridDataManager.update<Patient>('patients', patient.id, patient);
        return updatedPatient;
      } catch (error) {
        console.error("Erreur Hybrid updatePatient:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    throw new Error("Service patient indisponible");
  },

  async deletePatient(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("deletePatient appelé avec un ID invalide:", id);
      return false;
    }

    // Démo: suppression locale éphémère
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

    if (USE_SUPABASE) {
      try {
        const ok = await hybridDataManager.delete('patients', id);
        return ok;
      } catch (error) {
        console.error("Erreur Hybrid deletePatient:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    return false;
  },

  // Méthode pour injecter le contexte démo
  setDemoContext,
};
