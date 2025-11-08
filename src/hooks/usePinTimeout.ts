/**
 * ⏱️ Hook de timeout d'inactivité pour le PIN de stockage temporaire
 * 
 * Verrouille automatiquement le stockage chiffré après 15 minutes d'inactivité
 * pour renforcer la sécurité HDS.
 * 
 * Détecte l'activité utilisateur via:
 * - Mouvements de souris
 * - Clics
 * - Frappes au clavier
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   usePinTimeout(); // Active le timeout automatiquement
 *   return <div>...</div>
 * }
 * ```
 */

import { useEffect } from 'react';
import { encryptedWorkingStorage } from '@/services/storage/encrypted-working-storage';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 13 * 60 * 1000; // 13 minutes (avertissement 2 min avant)

export function usePinTimeout() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;
    let hasShownWarning = false;

    const resetTimeout = () => {
      // Réinitialiser les timeouts existants
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      hasShownWarning = false;

      // Avertissement à 13 minutes (2 minutes avant verrouillage)
      warningTimeoutId = setTimeout(() => {
        if (!hasShownWarning) {
          hasShownWarning = true;
          toast.warning('Inactivité détectée', {
            description: 'Le stockage sécurisé se verrouillera dans 2 minutes. Bougez votre souris pour rester connecté.',
            duration: 10000,
          });
        }
      }, WARNING_TIMEOUT_MS);

      // Verrouillage à 15 minutes
      timeoutId = setTimeout(() => {
        console.log('⏱️ Timeout inactivité: verrouillage du stockage chiffré');
        
        // Vérifier si le stockage est bien configuré et déverrouillé
        const isConfigured = localStorage.getItem('temp-storage-pin-hash');
        
        if (isConfigured) {
          // Verrouiller le stockage en supprimant les données sensibles de la mémoire
          try {
            // Afficher notification
            toast.info('Stockage verrouillé', {
              description: 'Votre session a été verrouillée après 15 minutes d\'inactivité. Rechargez la page et entrez votre PIN.',
              duration: 8000,
            });
            
            // Recharger la page après 3 secondes pour redemander le PIN
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } catch (error) {
            console.error('❌ Erreur lors du verrouillage:', error);
          }
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Liste des événements à surveiller pour détecter l'activité
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimeout, { passive: true });
    });

    // Démarrer le timeout initial
    resetTimeout();

    // Nettoyage à la destruction du composant
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, []);
}

/**
 * Hook pour afficher le temps restant avant verrouillage (optionnel)
 */
export function usePinTimeoutIndicator() {
  // TODO: Implémenter un indicateur visuel du temps restant
  // Peut être utilisé pour afficher un compte à rebours dans l'UI
}
