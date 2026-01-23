/**
 * 🎯 Hook pour détecter le mode de stockage (démo/connecté)
 * Source unique de vérité : AuthContext.isDemoMode
 */

import { useAuth } from '@/contexts/AuthContext';

export function useStorageMode() {
  const { isDemoMode, loading } = useAuth();
  return { isDemoMode, isLoading: loading };
}
