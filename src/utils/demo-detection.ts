/**
 * Détection du mode démo (FRONT-ONLY - localStorage uniquement)
 */

// Cache pour éviter les appels répétitifs
let demoSessionCache: { result: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 10000; // 10 secondes de cache

/**
 * Détecte si une session démo est active (localStorage uniquement)
 */
export const isDemoSession = async (): Promise<boolean> => {
  // Vérifier le cache d'abord
  const now = Date.now();
  if (demoSessionCache && (now - demoSessionCache.timestamp) < CACHE_DURATION) {
    return demoSessionCache.result;
  }

  try {
    const demoSessionStr = localStorage.getItem('osteopraxis_demo_session');

    if (!demoSessionStr) {
      const result = false;
      demoSessionCache = { result, timestamp: now };
      return result;
    }

    const session = JSON.parse(demoSessionStr);
    const isActive = session.expires_at && now < session.expires_at;

    const result = !!isActive;
    demoSessionCache = { result, timestamp: now };
    return result;
  } catch (error) {
    console.error('Erreur lors de la détection de session démo:', error);
    const result = false;
    demoSessionCache = { result, timestamp: now };
    return result;
  }
};

/**
 * Force le vidage du cache
 */
export const clearDemoSessionCache = (): void => {
  demoSessionCache = null;
};
