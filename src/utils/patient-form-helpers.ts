import { AppointmentStatus } from "@/types";

// Fonction pour valider et convertir la date
export const validateAndConvertDate = (dateString: string): string | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null; // Retourne null si la date est invalide
  }

  return date.toISOString(); // Convertit en format ISO pour Supabase
};

// Fonction pour valider et convertir le statut marital
export const validateMaritalStatus = (status: string): string | null => {
  const allowedStatuses = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED", "ENGAGED", "PARTNERED"];
  if (!status) return null;
  if (allowedStatuses.includes(status)) {
    return status;
  }
  return null;
};

// Fonction pour valider et convertir la latéralité
export const validateHandedness = (handedness: string): string | null => {
  const allowedHandedness = ["LEFT", "RIGHT", "AMBIDEXTROUS"];
  if (!handedness) return null;
  if (allowedHandedness.includes(handedness)) {
    return handedness;
  }
  return null;
};

// Fonction pour valider et convertir la contraception
export const validateContraception = (contraception: string): string | null => {
  const allowedContraceptions = ["NONE", "PILLS", "CONDOM", "IMPLANTS", "DIAPHRAGM", "IUD", "INJECTION", "PATCH", "RING", "NATURAL_METHODS", "STERILIZATION"];
  if (!contraception) return null;
  if (allowedContraceptions.includes(contraception)) {
    return contraception;
  }
  return null;
};

// Fonction pour valider et convertir le genre
export const validateGender = (gender: string): string | null => {
  const allowedGenders = ["Homme", "Femme"];
  if (!gender) return null;
  if (allowedGenders.includes(gender)) {
    return gender;
  }
  return null;
};

// Fonction pour valider et convertir les âges des enfants
export const validateChildrenAges = (ages: string): number[] | null => {
  if (!ages) return null;

  try {
    const parsedAges = JSON.parse(ages);

    if (!Array.isArray(parsedAges)) {
      return null;
    }

    const validatedAges = parsedAges.map((age: any) => {
      const parsedAge = Number(age);
      return isNaN(parsedAge) || parsedAge < 0 ? null : parsedAge;
    }).filter(age => age !== null);

    if (validatedAges.length === 0) {
      return null;
    }

    return validatedAges as number[];
  } catch (error) {
    console.error("Erreur lors de la validation des âges des enfants:", error);
    return null;
  }
};

// Fonction pour valider et convertir le statut du rendez-vous
export const validateAppointmentStatus = (status: string): AppointmentStatus | null => {
  const allowedStatuses: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW", "RESCHEDULED"];
  if (!status) return null;
  if (allowedStatuses.includes(status as AppointmentStatus)) {
    return status as AppointmentStatus;
  }
  return null;
};
