
import { Patient } from "@/types";

// Mock data for demonstration
const patients: Patient[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    gender: "Homme",
    email: "jean.dupont@example.com",
    phone: "0123456789",
    address: "123 Rue de Paris",
    osteopathId: 1,
    cabinetId: 1,
    birthDate: "1980-01-01",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    maritalStatus: "MARRIED",
    handedness: "RIGHT",
    hasVisionCorrection: false,
    isSmoker: false,
    isDeceased: false
  },
  {
    id: 2,
    firstName: "Marie",
    lastName: "Martin",
    gender: "Femme",
    email: "marie.martin@example.com",
    phone: "0123456780",
    address: "456 Avenue de Lyon",
    osteopathId: 1,
    cabinetId: 1,
    birthDate: "1990-05-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    maritalStatus: "SINGLE",
    handedness: "LEFT",
    hasVisionCorrection: true,
    isSmoker: false,
    isDeceased: false
  }
];

export const getPatients = async (): Promise<Patient[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...patients];
};

export const getPatientById = async (id: number): Promise<Patient | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const patient = patients.find(p => p.id === id);
  return patient || null;
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newPatient: Patient = {
    ...patientData,
    id: patients.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  patients.push(newPatient);
  return newPatient;
};

export const updatePatient = async (id: number, patientData: Partial<Patient>): Promise<Patient> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = patients.findIndex(p => p.id === id);
  if (index !== -1) {
    patients[index] = {
      ...patients[index],
      ...patientData,
      updatedAt: new Date().toISOString()
    };
    return patients[index];
  }
  
  throw new Error(`Patient with ID ${id} not found`);
};

export const deletePatient = async (id: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = patients.findIndex(p => p.id === id);
  if (index !== -1) {
    patients.splice(index, 1);
    return true;
  }
  
  return false;
};

export const searchPatients = async (query: string): Promise<Patient[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const lowerQuery = query.toLowerCase();
  return patients.filter(patient => 
    patient.firstName.toLowerCase().includes(lowerQuery) ||
    patient.lastName.toLowerCase().includes(lowerQuery) ||
    patient.email.toLowerCase().includes(lowerQuery) ||
    patient.phone.includes(lowerQuery)
  );
};

export const getPatientsByOsteopathId = async (osteopathId: number): Promise<Patient[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return patients.filter(patient => patient.osteopathId === osteopathId);
};

export const getPatientCount = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return patients.length;
};
