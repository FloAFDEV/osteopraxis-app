
import { Patient } from "@/types";
import { delay, USE_SUPABASE, SIMULATE_AUTH } from "./config";
import { supabasePatientService } from "../supabase-api/patient-service";

// Empty array for patients to remove fictitious data
const patients: Patient[] = [];

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        return await supabasePatientService.getPatients();
      } catch (error) {
        console.error("Erreur Supabase getPatients:", error);
        if (SIMULATE_AUTH) {
          console.warn("Mode développement activé: utilisation des données simulées");
          await delay(300);
          return [...patients];
        }
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...patients];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabasePatientService.getPatientById(id);
      } catch (error) {
        console.error("Erreur Supabase getPatientById:", error);
        if (SIMULATE_AUTH) {
          console.warn("Mode développement activé: utilisation des données simulées");
          await delay(200);
          return patients.find(patient => patient.id === id);
        }
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return patients.find(patient => patient.id === id);
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    if (USE_SUPABASE) {
      try {
        const createdPatient = await supabasePatientService.createPatient(patient);
        return createdPatient;
      } catch (error) {
        console.error("Erreur Supabase createPatient:", error);
        if (SIMULATE_AUTH) {
          console.warn("Mode développement activé: création simulée du patient");
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
        }
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
    if (USE_SUPABASE) {
      try {
        console.log("Appel à supabasePatientService.updatePatient avec l'ID:", patient.id);
        
        // Ensure the patient ID is a number
        if (typeof patient.id === 'string') {
          patient.id = parseInt(patient.id, 10);
        }
        
        // Validate patient ID is present
        if (!patient.id) {
          throw new Error("Patient ID is required for update");
        }
        
        // Handle birthDate properly - ensuring it's a string if not null
        if (patient.birthDate !== null && patient.birthDate !== undefined) {
          // Handle the special date object format
          if (typeof patient.birthDate === 'object') {
            // Check for special _type property
            const birthDateObj = patient.birthDate as any;
            if (birthDateObj._type === 'Date') {
              patient.birthDate = new Date(birthDateObj.value.iso).toISOString();
            } else if ('toISOString' in birthDateObj) {
              // Check if it's a Date object (has toISOString method)
              patient.birthDate = birthDateObj.toISOString();
            }
          }
        }
        
        try {
          const updatedPatient = await supabasePatientService.updatePatient(patient);
          return updatedPatient;
        } catch (error: any) {
          // Check for permission error in development mode
          if (SIMULATE_AUTH && error?.code === '42501') {
            console.warn("Mode développement activé: mise à jour simulée du patient");
            // Fallback in dev mode when permission error occurs
            const index = patients.findIndex(p => p.id === patient.id);
            const updatedPatient = { 
              ...patient,
              updatedAt: new Date().toISOString() 
            };
            
            if (index !== -1) {
              patients[index] = updatedPatient;
            } else {
              patients.push(updatedPatient);
            }
            
            return updatedPatient;
          }
          throw error;
        }
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
    if (USE_SUPABASE) {
      try {
        const { error } = await supabasePatientService.deletePatient(id);
        if (error) {
          // Check for permission error in development mode
          if (SIMULATE_AUTH && error?.code === '42501') {
            console.warn("Mode développement activé: suppression simulée du patient");
            const index = patients.findIndex(p => p.id === id);
            if (index !== -1) {
              patients.splice(index, 1);
              return true;
            }
            return false;
          }
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
  }
};
