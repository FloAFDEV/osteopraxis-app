import { Patient } from "@/types";
import { delay, USE_SUPABASE, USE_FALLBACK } from "./config";
import { supabasePatientService } from "../supabase-api/patient-service";

// Données simulées pour les patients
const simulatedPatients: Patient[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@exemple.fr",
    gender: "Homme",
    birthDate: "1985-05-12",
    phone: "0601020304",
    address: "12 rue des Lilas, 75001 Paris",
    createdAt: "2024-02-15T09:30:00Z",
    updatedAt: "2024-02-15T09:30:00Z",
    isSmoker: false,
    isDeceased: false,
    hasVisionCorrection: true,
    osteopathId: 1
  },
  {
    id: 2,
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@exemple.fr",
    gender: "Femme",
    birthDate: "1992-08-27",
    phone: "0607080910",
    address: "25 avenue Victor Hugo, 75016 Paris",
    createdAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
    isSmoker: false,
    isDeceased: false,
    hasVisionCorrection: false,
    osteopathId: 1
  },
  {
    id: 3,
    firstName: "Thomas",
    lastName: "Bernard",
    email: "thomas.bernard@exemple.fr",
    gender: "Homme",
    birthDate: "1978-11-03",
    phone: "0645678912",
    address: "8 rue du Commerce, 75015 Paris",
    createdAt: "2023-12-10T10:00:00Z",
    updatedAt: "2023-12-10T10:00:00Z",
    isSmoker: true,
    isDeceased: false,
    hasVisionCorrection: true,
    osteopathId: 1
  }
];

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        const patients = await supabasePatientService.getPatients();
        console.log("Retrieved patients from Supabase:", patients.length);
        return patients;
      } catch (error) {
        console.error("Error in getPatients from Supabase:", error);
        
        // Si le mode fallback est activé, utiliser les données simulées
        if (USE_FALLBACK) {
          console.log("Fallback: Returning simulated patients data");
          await delay(300);
          return [...simulatedPatients];
        }
        throw error;
      }
    }
    
    // Mode local: utiliser directement les données simulées
    console.log("Using local simulated patient data");
    await delay(300);
    return [...simulatedPatients];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (USE_SUPABASE) {
      try {
        const patient = await supabasePatientService.getPatientById(id);
        return patient || undefined;
      } catch (error) {
        console.error("Erreur Supabase getPatientById:", error);
        
        // Fallback sur données simulées en cas d'erreur
        if (USE_FALLBACK) {
          await delay(200);
          return simulatedPatients.find(patient => patient.id === id);
        }
        throw error;
      }
    }
    
    // Mode local: utiliser directement les données simulées
    await delay(200);
    return simulatedPatients.find(patient => patient.id === id);
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
      id: simulatedPatients.length + 1,
      createdAt: now,
      updatedAt: now,
    } as Patient;
    simulatedPatients.push(newPatient);
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
    const index = simulatedPatients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      simulatedPatients[index] = { 
        ...simulatedPatients[index], 
        ...patient,
        updatedAt: new Date().toISOString() 
      };
      return simulatedPatients[index];
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
    const index = simulatedPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      simulatedPatients.splice(index, 1);
      return true;
    }
    return false;
  }
};
