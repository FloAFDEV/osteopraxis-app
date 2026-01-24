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
 * Détecte spécifiquement si on est dans une preview iframe
 */
export function isIframePreview(): boolean {
  try {
    const isIframe = isInIframe();
    const url = window.location.href;

    // Vérifier les patterns de preview connus
    const isPreviewUrl =
      url.includes('.app') ||
      url.includes('.dev') ||
      url.includes('preview');

    return isIframe && isPreviewUrl;
  } catch {
    return false;
  }
}

/**
 * Obtient le contexte d'exécution de l'application
 */
export function getExecutionContext(): {
  isIframe: boolean;
  isIframePreview: boolean;
  canUseFSA: boolean;
  recommendedBackend: 'FSA' | 'IndexedDB';
} {
  const isIframe = isInIframe();
  const isPreview = isIframePreview();
  const canUseFSA = !isIframe && 'showDirectoryPicker' in window;

  return {
    isIframe,
    isIframePreview: isPreview,
    canUseFSA,
    recommendedBackend: canUseFSA ? 'FSA' : 'IndexedDB'
  };
}
