
import { Patient } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabasePatientService } from "../supabase-api/patient-service";

// Tableau vide pour les patients pour supprimer les données fictives
const patients: Patient[] = [];

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        console.log("API getPatients: Using Supabase");
        console.log("Making direct request to Supabase API");
        
        const patientsData = await supabasePatientService.getPatients();
        
        console.log(`API getPatients: Récupéré ${patientsData.length} patients depuis Supabase`);
        
        // Debug: log the first patient if exists
        if (patientsData && patientsData.length > 0) {
          console.log("Premier patient trouvé:", patientsData[0]);
        } else {
          console.log("Aucun patient trouvé dans Supabase");
        }
        
        return patientsData;
      } catch (error) {
        console.error("Erreur Supabase getPatients:", error);
        throw error; // Important: propagate the error to handle it in the UI
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...patients];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (USE_SUPABASE) {
      try {
        console.log(`API getPatientById: Fetching patient with ID ${id}...`);
        const patient = await supabasePatientService.getPatientById(id);
        console.log(`API getPatientById: Patient found? ${patient ? 'Yes' : 'No'}`);
        return patient;
      } catch (error) {
        console.error("Erreur Supabase getPatientById:", error);
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
        // Use the supabase patient service for update
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
        console.log(`API deletePatient: Deleting patient with ID ${id}...`);
        const result = await supabasePatientService.deletePatient(id);
        
        if (result.error) {
          console.error("Erreur lors de la suppression:", result.error);
          throw result.error;
        }
        
        console.log(`API deletePatient: Patient ${id} successfully deleted`);
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
