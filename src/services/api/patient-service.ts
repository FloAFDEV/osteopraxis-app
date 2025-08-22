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
    console.log("🏥 PatientService.createPatient - Début", patient);
    // Démo: données locales éphémères (pas d'appel Supabase)
    if (demoContext?.isDemoMode) {
      console.log("🎭 Mode démo détecté dans createPatient");
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

    console.log("☁️ Mode Supabase détecté dans createPatient");
    if (USE_SUPABASE) {
      console.log("🔧 Début traitement Supabase");
      try {
        // Forcer l'osteopathId via service existant puis créer en local sécurisé
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        const securedPatientData = {
          ...patient,
          osteopathId,
          cabinetId: patient.cabinetId || null,
        } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
        
        console.log("Tentative de création patient avec stockage local sécurisé...");
        const created = await hybridDataManager.create<Patient>('patients', securedPatientData);
        
        // CORRECTION: Vérifier explicitement que le patient a été créé correctement
        if (created && created.id) {
          console.log("✅ Patient créé avec succès en stockage local sécurisé:", created.id);
          
          // S'assurer que le patient est immédiatement disponible pour la lecture
          try {
            const verification = await hybridDataManager.getById<Patient>('patients', created.id);
            if (!verification) {
              console.warn("⚠️ Patient créé mais non trouvé immédiatement, attente...");
              // Petit délai pour laisser le temps au stockage
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (verifyError) {
            console.warn("Erreur de vérification post-création:", verifyError);
          }
          
          return created;
        } else {
          throw new Error("Échec de la création patient - données incomplètes");
        }
      } catch (error) {
        console.error("❌ Erreur création patient:", error);
        
        // CORRECTION: Messages d'erreur explicites pour éviter la confusion
        if ((error as any)?.message?.includes('CONFORMITÉ')) {
          // Erreur de conformité HDS - ne pas masquer
          throw new Error("❌ ERREUR CRITIQUE: Impossible de créer le patient en mode sécurisé. Le stockage local est requis pour la conformité HDS.");
        } else if ((error as any)?.message?.includes('permission denied') || (error as any)?.code === '42501') {
          throw new Error("❌ ERREUR D'AUTORISATION: Vous n'avez pas les permissions pour créer ce patient.");
        } else {
          throw new Error(`❌ ERREUR DE CRÉATION: ${(error as any)?.message || 'Échec de la création du patient'}`);
        }
      }
    }

    // Pas de mode démo et Supabase désactivé
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
