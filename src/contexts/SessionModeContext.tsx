import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isDemoSession, clearDemoSessionCache } from '@/utils/demo-detection';

interface SessionModeContextType {
  isDemoMode: boolean;
  isLoading: boolean;
}

const SessionModeContext = createContext<SessionModeContextType | undefined>(undefined);

export function SessionModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const detectOnce = async () => {
      try {
        const result = await isDemoSession();
        if (mounted) {
          setIsDemoMode(result);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur détection mode session:', error);
        if (mounted) {
          setIsDemoMode(false); // Fallback mode connecté
          setIsLoading(false);
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
