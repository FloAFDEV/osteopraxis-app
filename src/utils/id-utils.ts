/**
 * Utilitaires pour la gestion des IDs hybrides (number en mode connecté, UUID en mode démo)
 *
 * IMPORTANT: Ne jamais utiliser parseInt() seul sur un ID potentiellement UUID.
 * parseInt("4c455db1-08eb-46e7-8075-bade8ab41bc0", 10) retourne 4 (BUG!)
 * Number("4c455db1-08eb-46e7-8075-bade8ab41bc0") retourne NaN (correct)
 */

/**
 * Parse un ID de route qui peut être soit un number (mode connecté) soit un UUID (mode démo).
 *
 * @param id - L'ID sous forme de string provenant de useParams()
 * @returns L'ID en number si c'est un entier valide, sinon la string originale (UUID)
 *
 * @example
 * parseEntityId("123")                                    // => 123 (number)
 * parseEntityId("4c455db1-08eb-46e7-8075-bade8ab41bc0")  // => "4c455db1-08eb-..." (string)
 * parseEntityId("0")                                      // => "0" (string, car invalide)
 * parseEntityId("-5")                                     // => "-5" (string, car négatif)
 */
export function parseEntityId(id: string | undefined): number | string {
  if (!id) {
    return '';
  }

  // Utiliser Number() et non parseInt() car:
  // - Number("4c455db1-...") = NaN (correct - c'est un UUID)
  // - parseInt("4c455db1-...", 10) = 4 (INCORRECT - parse jusqu'au premier non-digit)
  const numericValue = Number(id);

  // Vérifier que c'est un entier positif valide
  if (!isNaN(numericValue) && Number.isInteger(numericValue) && numericValue > 0) {
    return numericValue;
  }

  // C'est un UUID ou un format non-numérique - retourner tel quel
  return id;
}

/**
 * Vérifie si un ID est un UUID (format string non-numérique)
 */
export function isUUID(id: string | number | undefined): boolean {
  if (!id) return false;
  if (typeof id === 'number') return false;

  // Vérifie si ça ressemble à un UUID (format standard)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Vérifie si un ID est un nombre entier positif
 */
export function isNumericId(id: string | number | undefined): boolean {
  if (!id) return false;
  if (typeof id === 'number') return Number.isInteger(id) && id > 0;

  const numericValue = Number(id);
  return !isNaN(numericValue) && Number.isInteger(numericValue) && numericValue > 0;
}
