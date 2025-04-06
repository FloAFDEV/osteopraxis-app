
import { User, Role, Patient } from "@/types";

export const convertHasChildrenToBoolean = (hasChildren?: string | boolean): boolean => {
  if (typeof hasChildren === 'boolean') return hasChildren;
  if (hasChildren === 'true') return true;
  if (hasChildren === 'false') return false;
  return false;
};

export const formatChildrenAges = (ages?: number[]): string => {
  if (!ages || !ages.length) return '';
  return ages.join(', ');
};

export const isUserAdmin = (user?: User | null): boolean => {
  return !!user && user.role === 'ADMIN';
};

// Fonction pour adapter un patient depuis Supabase
export const adaptPatientFromSupabase = (patient: any): Patient => {
  return {
    ...patient,
    // Convertit hasChildren pour être consistant dans l'application
    hasChildren: patient.hasChildren || "false",
    // Assure que childrenAges est un tableau
    childrenAges: Array.isArray(patient.childrenAges) ? patient.childrenAges : [],
    // Traite contraception spécifiquement (pour gérer le cas où Supabase renvoie "IMPLANTS" au lieu de "IMPLANT")
    contraception: patient.contraception === "IMPLANTS" ? "IMPLANT" : patient.contraception,
  };
};

// Fonction pour adapter le statut d'un rendez-vous depuis Supabase
export const adaptAppointmentStatusFromSupabase = (status: string): string => {
  // Supabase peut renommer certains statuts, cette fonction permet de les normaliser
  const statusMap: Record<string, string> = {
    "PENDING": "PENDING",
    "CONFIRMED": "CONFIRMED",
    "CANCELED": "CANCELLED", // Notez la différence d'orthographe
    "COMPLETED": "COMPLETED",
    "CANCELLED": "CANCELLED",
    "MISSED": "MISSED"
  };
  
  return statusMap[status] || status;
};

// Fonction pour adapter le statut d'un rendez-vous pour Supabase
export const adaptAppointmentStatusForSupabase = (status: string): string => {
  // Cette fonction fait l'inverse de adaptAppointmentStatusFromSupabase
  const statusMap: Record<string, string> = {
    "PENDING": "PENDING",
    "CONFIRMED": "CONFIRMED", 
    "CANCELLED": "CANCELED", // Notez la différence d'orthographe
    "COMPLETED": "COMPLETED",
    "MISSED": "MISSED"
  };
  
  return statusMap[status] || status;
};

// Fonction pour préparer les données du patient avant de les envoyer à l'API
export const preparePatientForApi = (patientData: Partial<Patient>) => {
  return {
    ...patientData,
    // Convertir hasChildren en string si présent
    hasChildren: patientData.hasChildren !== undefined 
      ? (typeof patientData.hasChildren === 'boolean' ? String(patientData.hasChildren) : patientData.hasChildren)
      : undefined,
    // Adapter contraception si présent
    contraception: patientData.contraception ? 
      (patientData.contraception === "IMPLANT" ? "IMPLANTS" : patientData.contraception) : undefined
  };
};
