
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
    // Autres conversions si nécessaires...
  };
};
