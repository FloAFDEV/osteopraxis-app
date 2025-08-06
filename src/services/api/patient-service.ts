import { Patient } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabasePatientService, isPatientOwnedByCurrentOsteopath } from "../supabase-api/patient-service";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOsteopathId } from "@/services";

// Hook pour accéder au contexte démo depuis les services
let demoContext: any = null;
export const setDemoContext = (context: any) => {
  demoContext = context;
};

// Empty array for patients to remove fictitious data
const patients: Patient[] = [];

// Fonction utilitaire pour adapter les données Supabase
function adaptSupabasePatient(supaData: any): Patient {
  return supaData as Patient;
}

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    console.log("🏥 patientService.getPatients - Architecture hybride");
    
    // 1. Vérifier le mode démo classique (fallback)
    if (demoContext?.isDemoMode) {
      console.log("🎭 Mode démo classique actif");
      await delay(300);
      return [...demoContext.demoData.patients];
    }
    
    // 2. Architecture hybride - Données patients via Supabase
    try {
      const { data: supaPatientsData, error: supaError } = await supabase
        .from("Patient")
        .select("*")
        .eq("deleted_at", null);
    
      if (supaError) {
        console.error("❌ Erreur lors de la récupération des patients:", supaError);
        throw new Error("Erreur lors de la récupération des patients");
      }
    
      const supabasePatients = supaPatientsData || [];
      console.log(`📊 ${supabasePatients.length} patients trouvés via Supabase`);
    
      return supabasePatients;
    } catch (supabaseError: any) {
      // Si erreur de permissions, retourner tableau vide au lieu d'échouer
      if (supabaseError?.message?.includes('permission denied')) {
        console.warn("⚠️ Permissions Supabase refusées - Mode déconnecté");
        return [];
      }
      throw supabaseError;
    }
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    // Vérification de l'ID avant toute opération
    if (!id || isNaN(id) || id <= 0) {
      console.warn("getPatientById appelé avec un ID invalide:", id);
      return undefined;
    }

    // 1. Vérifier le mode démo classique (fallback)
    if (demoContext?.isDemoMode) {
      console.log("patientService.getPatientById: Using demo data for ID", id);
      await delay(200);
      return demoContext.demoData.patients.find((patient: any) => patient.id === id);
    }

    // 2. Architecture hybride - Stockage via Supabase
    try {
      return await supabasePatientService.getPatientById(id);
    } catch (error) {
      console.error("Erreur Supabase getPatientById:", error);
      return undefined;
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    if (USE_SUPABASE) {
      try {
        // Récupérer l'osteopathId de l'utilisateur connecté
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        
        // S'assurer que l'osteopathId est correct et que cabinetId est inclus
        const securedPatientData = {
          ...patient,
          osteopathId,
          cabinetId: patient.cabinetId || null
        };
        
        const createdPatient = await supabasePatientService.createPatient(securedPatientData);
        return createdPatient;
      } catch (error) {
        console.error("Erreur Supabase createPatient:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(400);
    const now = new Date().toISOString();
    const newPatient = {
      ...patient,
      id: patients.length + 1,
      createdAt: now,
      updatedAt: now,
    } as Patient;
    patients.push(newPatient);
    return newPatient;
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    // Vérification de l'ID avant mise à jour
    if (!patient.id || isNaN(patient.id) || patient.id <= 0) {
      throw new Error("ID patient invalide pour la mise à jour");
    }

    if (USE_SUPABASE) {
      try {
        // Use the supabase patient service for update
        const updatedPatient = await supabasePatientService.updatePatient(patient);
        // Ne pas afficher de toast ici pour éviter les doublons
        // Le toast sera affiché dans le composant appelant
        return updatedPatient;
      } catch (error) {
        console.error("Erreur Supabase updatePatient:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      patients[index] = { 
        ...patients[index], 
        ...patient,
        updatedAt: new Date().toISOString() 
      };
      return patients[index];
    }
    throw new Error(`Patient with id ${patient.id} not found`);
  },

  async deletePatient(id: number): Promise<boolean> {
    // Vérification de l'ID avant suppression
    if (!id || isNaN(id) || id <= 0) {
      console.warn("deletePatient appelé avec un ID invalide:", id);
      return false;
    }

    if (USE_SUPABASE) {
      try {
        const { error } = await supabasePatientService.deletePatient(id);
        if (error) {
          throw error;
        }
        return true;
      } catch (error) {
        console.error("Erreur Supabase deletePatient:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Méthode pour injecter le contexte démo
  setDemoContext,
};

// Export la fonction isPatientOwnedByCurrentOsteopath pour la sécurité
export { isPatientOwnedByCurrentOsteopath };