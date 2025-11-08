/**
 * 🎯 Hook pour détecter le mode de stockage (démo/connecté)
 * Wrapper autour de DemoContext pour compatibilité
 */

import { useDemo } from '@/contexts/DemoContext';

export function useStorageMode() {
  const { isDemoMode, isLoading } = useDemo();
  return { isDemoMode, isLoading };
}
