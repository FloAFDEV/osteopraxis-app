import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useStorageLockCheck() {
  const { isDemoMode } = useAuth();

  useEffect(() => {
    if (isDemoMode) {
      return;
    }
  }, [isDemoMode]);
}
