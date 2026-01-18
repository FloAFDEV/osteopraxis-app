import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface DemoContextType {
  isDemoMode: boolean;
  isLoading: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const checkDemoMode = () => {
      try {
        // Détection simple via localStorage
        const demoSession = localStorage.getItem('osteopraxis_demo_session');

        if (!demoSession) {
          if (mounted) {
            setIsDemoMode(false);
            setIsLoading(false);
          }
          return;
        }

        const session = JSON.parse(demoSession);
        const now = Date.now();
        const isActive = session.expires_at && now < session.expires_at;

        if (mounted) {
          const previousMode = isDemoMode;
          setIsDemoMode(isActive);

          // Nettoyer le cache lors du changement de mode
          if (previousMode !== null && previousMode !== isActive) {
            console.log(`🧹 Changement de mode détecté: ${previousMode ? 'DEMO' : 'RÉEL'} → ${isActive ? 'DEMO' : 'RÉEL'}`);
            queryClient.clear();
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de la détection du mode demo:', error);
        if (mounted) {
          setIsDemoMode(false);
          setIsLoading(false);
        }
      }
    };

    checkDemoMode();

    // Vérifier toutes les 10 secondes (réduit de 1s)
    const interval = setInterval(checkDemoMode, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isDemoMode, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <DemoContext.Provider value={{ isDemoMode, isLoading }}>
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
