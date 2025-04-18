
import { Patient } from "@/types";
import { delay, USE_SUPABASE } from "./config";
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
        throw error; // Let the error propagate up for proper handling
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
        throw error; // Let the error propagate up for proper handling
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
        if (patient.birthDate) {
          // Handle the special date object format
          if (typeof patient.birthDate === 'object') {
            if (patient.birthDate._type === 'Date') {
              // Handle the special date object format
              patient.birthDate = new Date(patient.birthDate.value.iso).toISOString();
            } else if (patient.birthDate instanceof Date) {
              // Convert Date object to ISO string
              patient.birthDate = patient.birthDate.toISOString();
            }
          }
        }
        
        const updatedPatient = await supabasePatientService.updatePatient(patient);
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
  }
};
