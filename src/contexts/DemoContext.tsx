import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isDemoSession } from '@/utils/demo-detection';

interface DemoContextType {
  isDemoMode: boolean | null; // null = en cours de détection
  isLoading: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    
    const checkDemoMode = async () => {
      try {
        const demoDetected = await isDemoSession();
        
        if (mounted) {
          const previousMode = isDemoMode;
          setIsDemoMode(demoDetected);
          
          // 🚨 SÉCURITÉ CRITIQUE: Nettoyer le cache lors du changement de mode
          if (previousMode !== null && previousMode !== demoDetected) {
            console.log(`🧹 Changement de mode détecté: ${previousMode ? 'DEMO' : 'CONNECTÉ'} → ${demoDetected ? 'DEMO' : 'CONNECTÉ'} - Nettoyage du cache`);
            queryClient.clear(); // Vider complètement le cache pour éviter les fuites de données
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
    
    // Vérifier plus fréquemment les changements de mode pour une réactivité immédiate
    const interval = setInterval(checkDemoMode, 1000);
    
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