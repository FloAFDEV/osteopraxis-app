// Ce fichier contient des utilitaires pour le traitement des données des patients
import { Patient } from "@/types";

/**
 * Adapte les données d'un patient depuis le format Supabase vers le format interne
 */
export function adaptPatientFromSupabase(supabasePatient: any): Patient {
  // Assure-toi de logger les données brutes pour le débogage
  console.log("Adapting patient from Supabase:", supabasePatient);
  
  // Vérifie que l'objet patient existe
  if (!supabasePatient) {
    console.warn("Patient data is null or undefined");
    return {} as Patient;
  }

  // Retourne un objet patient adapté
  return {
    ...supabasePatient,
    // Assure-toi que les dates sont correctement formatées
    birthDate: supabasePatient.birthDate || null,
    createdAt: supabasePatient.createdAt || new Date().toISOString(),
    updatedAt: supabasePatient.updatedAt || new Date().toISOString(),
    // Assure-toi que les tableaux sont correctement initialisés
    childrenAges: Array.isArray(supabasePatient.childrenAges) ? supabasePatient.childrenAges : [],
  };
}

/**
 * Prépare les données d'un patient pour l'API
 */
export function preparePatientForApi(patient: Partial<Patient>): any {
  return {
    ...patient,
    // Transforme les booléens en chaînes si nécessaire pour la compatibilité
    hasChildren: patient.hasChildren?.toString() || "false",
  };
}

/**
 * Affiche les informations d'un patient pour le débogage
 */
export function debugPatient(patient: Patient | undefined, label: string = "Patient"): void {
  if (!patient) {
    console.log(`${label}: undefined`);
    return;
  }
  
  console.log(`${label}:`, {
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
    gender: patient.gender,
    birthDate: patient.birthDate,
    email: patient.email,
    phone: patient.phone,
    address: patient.address,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  });
}
