/**
 * 🖼️ Détection du contexte iframe/preview
 * Permet d'adapter le comportement du stockage selon l'environnement
 */

/**
 * Détecte si l'application tourne dans un iframe
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // Si on ne peut pas accéder à window.top, on est dans un iframe avec restrictions
    return true;
  }
}

/**
 * Détecte spécifiquement si on est dans la preview Lovable
 */
export function isLovablePreview(): boolean {
  try {
    const isIframe = isInIframe();
    const url = window.location.href;
    
    // Vérifier les patterns Lovable connus
    const isLovableUrl = 
      url.includes('lovable.app') || 
      url.includes('lovable.dev') ||
      url.includes('gptengineer.app');
    
    return isIframe && isLovableUrl;
  } catch {
    return false;
  }
}

/**
 * Obtient le contexte d'exécution de l'application
 */
export function getExecutionContext(): {
  isIframe: boolean;
  isLovablePreview: boolean;
  canUseFSA: boolean;
  recommendedBackend: 'FSA' | 'IndexedDB';
} {
  const isIframe = isInIframe();
  const isPreview = isLovablePreview();
  const canUseFSA = !isIframe && 'showDirectoryPicker' in window;
  
  return {
    isIframe,
    isLovablePreview: isPreview,
    canUseFSA,
    recommendedBackend: canUseFSA ? 'FSA' : 'IndexedDB'
  };
}
