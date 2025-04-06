
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
  // Vérification que patient existe et n'est pas null
  if (!patient) {
    console.error("Patient is null or undefined");
    throw new Error("Patient data is missing");
  }
  
  console.log("Adapting patient from Supabase:", patient);
  
  // Vérifier si les champs obligatoires sont présents
  if (!patient.firstName && !patient.lastName) {
    console.error("Patient missing required fields:", patient);
  }
  
  // Assurer que childrenAges est toujours un tableau
  let childrenAges = [];
  if (patient.childrenAges) {
    try {
      // Si c'est une chaîne JSON, on la parse
      if (typeof patient.childrenAges === 'string') {
        childrenAges = JSON.parse(patient.childrenAges);
      } else if (Array.isArray(patient.childrenAges)) {
        childrenAges = patient.childrenAges;
      }
    } catch (e) {
      console.error("Error parsing childrenAges:", e);
      childrenAges = [];
    }
  }
  
  // Convertir la date de naissance en chaîne si c'est un objet Date
  let birthDate = patient.birthDate;
  if (birthDate instanceof Date) {
    birthDate = birthDate.toISOString();
  }
  
  return {
    id: patient.id,
    userId: patient.userId || null,
    osteopathId: patient.osteopathId || 1,
    cabinetId: patient.cabinetId || 1,
    createdAt: patient.createdAt || new Date().toISOString(),
    updatedAt: patient.updatedAt || new Date().toISOString(),
    address: patient.address || null,
    avatarUrl: patient.avatarUrl || null,
    birthDate: birthDate || null,
    email: patient.email || null,
    phone: patient.phone || null,
    maritalStatus: patient.maritalStatus || "SINGLE",
    childrenAges: childrenAges,
    physicalActivity: patient.physicalActivity || null,
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    hasChildren: patient.hasChildren ? patient.hasChildren.toString() : "false",
    contraception: patient.contraception === "IMPLANTS" ? "IMPLANT" : patient.contraception || "NONE",
    currentTreatment: patient.currentTreatment || null,
    digestiveDoctorName: patient.digestiveDoctorName || null,
    digestiveProblems: patient.digestiveProblems || null,
    entDoctorName: patient.entDoctorName || null,
    entProblems: patient.entProblems || null,
    gender: patient.gender || "Homme",
    generalPractitioner: patient.generalPractitioner || null,
    handedness: patient.handedness || "RIGHT",
    hasVisionCorrection: typeof patient.hasVisionCorrection === 'boolean' ? patient.hasVisionCorrection : false,
    isDeceased: typeof patient.isDeceased === 'boolean' ? patient.isDeceased : false,
    isSmoker: typeof patient.isSmoker === 'boolean' ? patient.isSmoker : false,
    occupation: patient.occupation || null,
    ophtalmologistName: patient.ophtalmologistName || null,
    rheumatologicalHistory: patient.rheumatologicalHistory || null,
    surgicalHistory: patient.surgicalHistory || null,
    traumaHistory: patient.traumaHistory || null,
    hdlm: patient.hdlm || null
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
  console.log("Preparing patient for API:", patientData);
  
  // S'assurer que tous les champs obligatoires sont présents
  const prepared = {
    ...patientData,
    // Convertir hasChildren en string si présent
    hasChildren: patientData.hasChildren !== undefined 
      ? (typeof patientData.hasChildren === 'boolean' ? String(patientData.hasChildren) : patientData.hasChildren)
      : "false",
    // Adapter contraception si présent
    contraception: patientData.contraception ? 
      (patientData.contraception === "IMPLANT" ? "IMPLANTS" : patientData.contraception) : "NONE",
    // S'assurer que les champs obligatoires sont présents
    firstName: patientData.firstName || '',
    lastName: patientData.lastName || '',
    osteopathId: patientData.osteopathId || 1,
    cabinetId: patientData.cabinetId || 1
  };
  
  console.log("Prepared patient:", prepared);
  return prepared;
};

// Fonction debug pour afficher l'état complet d'un patient
export const debugPatient = (patient: any, label: string = "Patient debug") => {
  console.log(`==== ${label} ====`);
  console.log("ID:", patient.id);
  console.log("Name:", patient.firstName, patient.lastName);
  console.log("Birth date:", patient.birthDate);
  console.log("Gender:", patient.gender);
  console.log("Full object:", patient);
  console.log("========================");
};
