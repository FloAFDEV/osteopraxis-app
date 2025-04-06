
/**
 * Convertit une valeur de type string en boolean pour le champ hasChildren
 * @param value Une valeur qui peut être "true", "false" ou string
 * @returns boolean
 */
export const convertHasChildrenToBoolean = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return false;
};

/**
 * Formate les âges des enfants pour l'affichage
 * @param ages Tableau des âges ou null/undefined
 * @returns String formatée des âges (ex: "3, 5, 7")
 */
export const formatChildrenAges = (ages: number[] | null | undefined): string => {
  if (!ages || !Array.isArray(ages) || ages.length === 0) return 'Aucun';
  return ages.join(', ');
};

/**
 * Prépare un patient pour l'API Supabase
 * @param patient Objet patient à formater
 * @returns Patient formaté pour l'API
 */
export const preparePatientForApi = (patient: any) => {
  // Convertir les formats de date si nécessaire
  // Gérer les valeurs spéciales comme hasChildren
  return {
    ...patient,
    hasChildren: typeof patient.hasChildren !== 'undefined' 
      ? convertHasChildrenToBoolean(patient.hasChildren).toString()
      : 'false',
    // Adapter contraception pour correspondre exactement à l'enum Supabase
    contraception: patient.contraception === "IMPLANT" ? "IMPLANTS" : patient.contraception,
    // Autres conversions si nécessaires...
  };
};

/**
 * Adapte les données du patient depuis Supabase vers l'application
 * @param patient Patient récupéré de Supabase
 * @returns Patient adapté pour l'application
 */
export const adaptPatientFromSupabase = (patient: any) => {
  if (!patient) return null;
  
  return {
    ...patient,
    // Assurer la compatibilité avec les enums de l'application
    contraception: patient.contraception === "IMPLANTS" ? "IMPLANT" : patient.contraception,
    childrenAges: patient.childrenAges || []
  };
};

/**
 * Adapte le statut d'un rendez-vous de Supabase vers l'application
 * @param status Statut provenant de Supabase
 * @returns Statut adapté pour l'application
 */
export const adaptAppointmentStatusFromSupabase = (status: string) => {
  if (status === "CANCELED") return "CANCELLED";
  return status;
};

/**
 * Adapte le statut d'un rendez-vous de l'application vers Supabase
 * @param status Statut de l'application
 * @returns Statut adapté pour Supabase
 */
export const adaptAppointmentStatusForSupabase = (status: string) => {
  if (status === "CANCELLED") return "CANCELED";
  return status;
};
