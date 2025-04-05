
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
