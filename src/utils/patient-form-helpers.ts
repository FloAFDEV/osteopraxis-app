
// Ce fichier contient des utilitaires pour le traitement des données des patients
import { Patient, User, AppointmentStatus } from "@/types";

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

/**
 * Formate les âges des enfants pour l'affichage
 */
export function formatChildrenAges(ages: number[] | undefined): string {
  if (!ages || ages.length === 0) {
    return "Aucun";
  }
  return ages.sort((a, b) => a - b).join(", ");
}

/**
 * Convertit la valeur hasChildren de string à boolean
 */
export function convertHasChildrenToBoolean(hasChildren: string | boolean | undefined): boolean {
  if (typeof hasChildren === "boolean") {
    return hasChildren;
  }
  return hasChildren === "true" || hasChildren === "TRUE";
}

/**
 * Vérifie si un utilisateur est administrateur
 */
export function isUserAdmin(user: User | null): boolean {
  return user?.role === "ADMIN";
}

/**
 * Adapte le statut d'un rendez-vous depuis Supabase
 */
export function adaptAppointmentStatusFromSupabase(status: string): AppointmentStatus {
  const validStatuses: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"];
  
  if (validStatuses.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  }
  
  // Valeur par défaut si le statut n'est pas reconnu
  return "SCHEDULED";
}

/**
 * Adapte le statut d'un rendez-vous pour Supabase
 */
export function adaptAppointmentStatusForSupabase(status: AppointmentStatus): string {
  return status.toString();
}
