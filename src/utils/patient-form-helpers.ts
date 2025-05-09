
// Ce fichier contient des utilitaires pour le traitement des données des patients
import { Patient, User, AppointmentStatus, MaritalStatus, Contraception, Handedness, Gender } from "@/types";

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
    // S'assurer que les énumérations sont correctement définies
    gender: supabasePatient.gender as Gender || null,
    maritalStatus: supabasePatient.maritalStatus as MaritalStatus || null,
    contraception: supabasePatient.contraception as Contraception || null,
    handedness: supabasePatient.handedness as Handedness || null,
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
    // Assurer que les nouveaux champs sont correctement formatés
    complementaryExams: patient.complementaryExams || null,
    generalSymptoms: patient.generalSymptoms || null,
    pregnancyHistory: patient.pregnancyHistory || null,
    birthDetails: patient.birthDetails || null,
    developmentMilestones: patient.developmentMilestones || null,
    sleepingPattern: patient.sleepingPattern || null,
    feeding: patient.feeding || null,
    behavior: patient.behavior || null,
    childCareContext: patient.childCareContext || null,
    // S'assurer que les valeurs d'énumération sont définies
    gender: patient.gender || null,
    maritalStatus: patient.maritalStatus || null,
    handedness: patient.handedness || null,
    contraception: patient.contraception || null,
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
  const validStatuses: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELED", "RESCHEDULED", "NO_SHOW"];
  
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

/**
 * Vérifie si un patient est un enfant (moins de 17 ans)
 */
export function isChildPatient(patient: Patient | null): boolean {
  if (!patient || !patient.birthDate) return false;
  
  const birthDate = new Date(patient.birthDate);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  // Vérifie si l'anniversaire est déjà passé cette année
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1 < 17;
  }
  
  return age < 17;
}

/**
 * Obtient les options pour les menus déroulants en fonction du type d'énumération
 */
export function getEnumOptions(enumType: string): { value: string; label: string }[] {
  switch (enumType) {
    case 'MaritalStatus':
      return [
        { value: 'SINGLE', label: 'Célibataire' },
        { value: 'MARRIED', label: 'Marié(e)' },
        { value: 'DIVORCED', label: 'Divorcé(e)' },
        { value: 'WIDOWED', label: 'Veuf/Veuve' },
        { value: 'SEPARATED', label: 'Séparé(e)' },
        { value: 'ENGAGED', label: 'Fiancé(e)' },
        { value: 'PARTNERED', label: 'Pacsé(e)' },
      ];
    case 'Handedness':
      return [
        { value: 'LEFT', label: 'Gaucher' },
        { value: 'RIGHT', label: 'Droitier' },
        { value: 'AMBIDEXTROUS', label: 'Ambidextre' },
      ];
    case 'Contraception':
      return [
        { value: 'NONE', label: 'Aucune' },
        { value: 'PILLS', label: 'Pilule' },
        { value: 'CONDOM', label: 'Préservatif' },
        { value: 'IMPLANTS', label: 'Implant' },
        { value: 'DIAPHRAGM', label: 'Diaphragme' },
        { value: 'IUD', label: 'DIU (Dispositif Intra-Utérin)' },
        { value: 'INJECTION', label: 'Injection' },
        { value: 'PATCH', label: 'Patch' },
        { value: 'RING', label: 'Anneau vaginal' },
        { value: 'NATURAL_METHODS', label: 'Méthodes naturelles' },
        { value: 'STERILIZATION', label: 'Stérilisation' },
      ];
    case 'Gender':
      return [
        { value: 'Homme', label: 'Homme' },
        { value: 'Femme', label: 'Femme' },
        { value: 'Autre', label: 'Autre' },
      ];
    default:
      return [];
  }
}

/**
 * Transforme un libellé en valeur d'énumération
 */
export function getLabelFromEnumValue(enumType: string, value: string | null): string {
  if (!value) return '';
  
  const options = getEnumOptions(enumType);
  const option = options.find(opt => opt.value === value);
  return option ? option.label : '';
}

/**
 * Traduit le statut d'un rendez-vous en français
 */
export function translateAppointmentStatus(status: AppointmentStatus): string {
  switch (status) {
    case 'SCHEDULED':
      return 'Planifié';
    case 'COMPLETED':
      return 'Terminé';
    case 'CANCELED':
      return 'Annulé';
    case 'RESCHEDULED':
      return 'Reporté';
    case 'NO_SHOW':
      return 'Absence';
    default:
      return status;
  }
}

/**
 * Traduit l'état marital en français
 */
export function translateMaritalStatus(status: MaritalStatus | null | undefined): string {
  if (!status) return 'Non spécifié';
  
  const option = getEnumOptions('MaritalStatus').find(opt => opt.value === status);
  return option ? option.label : 'Non spécifié';
}

/**
 * Traduit le type de contraception en français
 */
export function translateContraception(contraception: Contraception | null | undefined): string {
  if (!contraception) return 'Non spécifiée';
  
  const option = getEnumOptions('Contraception').find(opt => opt.value === contraception);
  return option ? option.label : 'Non spécifiée';
}

/**
 * Traduit la latéralité en français
 */
export function translateHandedness(handedness: Handedness | null | undefined): string {
  if (!handedness) return 'Non spécifiée';
  
  const option = getEnumOptions('Handedness').find(opt => opt.value === handedness);
  return option ? option.label : 'Non spécifiée';
}
