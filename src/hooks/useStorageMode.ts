/**
 * 🎯 Hook pour détecter le mode de stockage (démo/connecté)
 * Wrapper autour de SessionModeContext pour compatibilité
 */

import { useSessionMode } from '@/contexts/SessionModeContext';

export function useStorageMode() {
  const { isDemoMode, isLoading } = useSessionMode();
  return { isDemoMode, isLoading };
}
