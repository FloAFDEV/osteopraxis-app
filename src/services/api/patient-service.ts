
import { Patient } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabasePatientService } from "../supabase-api/patient-service";

// Données simulées pour les patients
const patients: Patient[] = [
  {
    id: 1,
    userId: null,
    osteopathId: 1,
    cabinetId: 1,
    createdAt: "2024-01-29 17:39:35.473",
    updatedAt: "2024-02-20 00:00:00",
    address: "18 Rue Lafayette, Toulouse",
    avatarUrl: null,
    birthDate: "1985-09-30 00:00:00",
    email: "gabriel.fournier@example.com",
    phone: "0612345783",
    maritalStatus: "SINGLE",
    childrenAges: [],
    physicalActivity: "Running",
    firstName: "Gabriel",
    lastName: "Fournier",
    hasChildren: "false",
    contraception: "CONDOM",
    currentTreatment: "Physiotherapy",
    digestiveDoctorName: "Dr. Lee",
    digestiveProblems: "None",
    entDoctorName: "Dr. Taylor",
    entProblems: "None",
    gender: "Homme",
    generalPractitioner: "Dr. Scott",
    handedness: "RIGHT",
    hasVisionCorrection: true,
    isDeceased: false,
    isSmoker: false,
    occupation: "Teacher",
    ophtalmologistName: "Dr. Adams",
    rheumatologicalHistory: "Asthma",
    surgicalHistory: "None",
    traumaHistory: "Sports injury",
    hdlm: null
  },
  // Les autres patients fictifs sont maintenus mais omis pour plus de lisibilité
];

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        return await supabasePatientService.getPatients();
      } catch (error) {
        console.error("Erreur Supabase getPatients:", error);
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
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return patients.find(patient => patient.id === id);
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    if (USE_SUPABASE) {
      try {
        return await supabasePatientService.createPatient(patient);
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

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabasePatientService.updatePatient(id, patient);
      } catch (error) {
        console.error("Erreur Supabase updatePatient:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { 
        ...patients[index], 
        ...patient,
        updatedAt: new Date().toISOString() 
      };
      return patients[index];
    }
    return undefined;
  }
};
