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

    // Utilisateur connecté: stockage hybride avec fallback Supabase
    if (USE_SUPABASE) {
      try {
        return await hybridDataManager.get<Patient>('patients');
      } catch (error) {
        console.error("Erreur Hybrid getPatients:", error);
        // Fallback vers Supabase
        try {
          return await supabasePatientService.getPatients();
        } catch (supabaseError) {
          console.error("Erreur Supabase getPatients:", supabaseError);
          return [];
        }
      }
    }

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

    // Utilisateur connecté: stockage hybride avec fallback Supabase
    if (USE_SUPABASE) {
      try {
        const res = await hybridDataManager.getById<Patient>('patients', id);
        if (res) return res;
      } catch (error) {
        console.error("Erreur Hybrid getPatientById:", error);
      }
      
      // Fallback vers Supabase si pas trouvé en local
      try {
        return await supabasePatientService.getPatientById(id);
      } catch (supabaseError) {
        console.error("Erreur Supabase getPatientById:", supabaseError);
        return undefined;
      }
    }

    return undefined;
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Démo: données locales éphémères
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

    // Utilisateur connecté: d'abord stockage hybride, puis Supabase si échec
    if (USE_SUPABASE) {
      try {
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        
        const securedPatientData = {
          ...patient,
          osteopathId,
          cabinetId: patient.cabinetId || null,
        } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
        
        // Tentative création via stockage hybride
        const created = await hybridDataManager.create<Patient>('patients', securedPatientData);
        return created;
      } catch (error) {
        console.error("Erreur Hybrid createPatient:", error);
        // Si erreur de conformité HDS, relancer sans fallback
        if ((error as any)?.message?.includes('CONFORMITÉ')) {
          throw new Error("❌ ERREUR CRITIQUE: Impossible de créer le patient en mode sécurisé. Le stockage local est requis pour la conformité HDS.");
        }
        throw error;
      }
    }

    throw new Error("❌ Service patient indisponible");
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
        console.log(`🗑️ Tentative de suppression patient ID: ${id}`);
        const ok = await hybridDataManager.delete('patients', id);
        console.log(`✅ Suppression patient ${id} réussie:`, ok);
        return ok;
      } catch (error) {
        console.error("❌ Erreur Hybrid deletePatient:", error);
        
        // Si c'est une erreur de conformité HDS, essayer la suppression directe localStorage
        if ((error as any)?.message?.includes('CONFORMITÉ') || (error as any)?.message?.includes('stockage local sécurisé')) {
          console.log(`🔄 Tentative de suppression directe localStorage pour patient ${id}`);
          try {
            // Accès direct au localStorage pour la suppression
            const storageKey = 'patient-hub-local-hds-data';
            const localData = JSON.parse(localStorage.getItem(storageKey) || '{}');
            
            if (localData.patients) {
              const patientIndex = localData.patients.findIndex((p: any) => p.id === id || p.id === String(id));
              if (patientIndex !== -1) {
                localData.patients.splice(patientIndex, 1);
                localStorage.setItem(storageKey, JSON.stringify(localData));
                console.log(`✅ Patient ${id} supprimé directement du localStorage`);
                return true;
              } else {
                console.warn(`⚠️ Patient ${id} non trouvé dans localStorage`);
                return false;
              }
            }
            return false;
          } catch (localError) {
            console.error("❌ Erreur suppression directe localStorage:", localError);
            throw error; // Relancer l'erreur originale
          }
        } else {
          throw error;
        }
      }
    }

    // Pas de mode démo et Supabase désactivé
    return false;
  },

  // Méthode pour injecter le contexte démo
  setDemoContext,
};
