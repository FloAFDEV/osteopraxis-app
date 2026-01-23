/**
 * ⚠️ DEPRECATED: Ce contexte est maintenant un alias de AuthContext.isDemoMode
 * Source unique de vérité : AuthContext
 * Conservé pour rétrocompatibilité, mais toute nouvelle fonctionnalité doit utiliser useAuth().isDemoMode
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface DemoContextType {
  isDemoMode: boolean;
  isLoading: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // ✅ Source unique de vérité : AuthContext.isDemoMode
  const { isDemoMode, loading } = useAuth();

  return (
    <DemoContext.Provider value={{ isDemoMode, isLoading: loading }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
