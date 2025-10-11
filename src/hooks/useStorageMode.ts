/**
 * 🎯 Hook pour détecter le mode de stockage (démo/connecté)
 * Optimisé avec cache pour éviter les appels répétés
 */

import { useState, useEffect } from 'react';
import { isDemoSession } from '@/utils/demo-detection';

export function useStorageMode() {
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const detectMode = async () => {
      try {
        const isDemo = await isDemoSession();
        if (mounted) {
          setIsDemoMode(isDemo);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur détection mode:', error);
        if (mounted) {
          setIsDemoMode(false); // Par défaut : mode connecté
          setIsLoading(false);
        }
      }
    };

    detectMode();

    return () => {
      mounted = false;
    };
  }, []); // Une seule fois au montage

  return { isDemoMode, isLoading };
}
