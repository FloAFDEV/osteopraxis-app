import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isDemoSession, clearDemoSessionCache } from '@/utils/demo-detection';

interface SessionModeContextType {
  isDemoMode: boolean;
  isLoading: boolean;
}

const SessionModeContext = createContext<SessionModeContextType | undefined>(undefined);

export function SessionModeProvider({ children }: { children: ReactNode }) {
  // ⚡ OPTIMISTE : On démarre en mode connecté (cas le plus courant) pour ne pas bloquer le rendu
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const detectOnce = async () => {
      try {
        const result = await isDemoSession();
        // Seulement mettre à jour si différent (évite les re-renders inutiles)
        if (mounted && result !== isDemoMode) {
          setIsDemoMode(result);
        }
      } catch (error) {
        console.error('Erreur détection mode session:', error);
        if (mounted) {
          setIsDemoMode(false); // Fallback mode connecté
        }
      }
    };

    detectOnce();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SessionModeContext.Provider value={{ isDemoMode, isLoading }}>
      {children}
    </SessionModeContext.Provider>
  );
}

export function useSessionMode() {
  const context = useContext(SessionModeContext);
  if (!context) {
    throw new Error('useSessionMode must be used within SessionModeProvider');
  }
  return context;
}
