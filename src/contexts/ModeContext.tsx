import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'demo' | 'local';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isDemo: boolean;
  isLocal: boolean;
  getDemoSessionId: () => string;
  clearDemoSession: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

// Gestion des sessions démo éphémères (30 minutes)
const DEMO_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

function generateDemoSessionId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isDemoSessionExpired(sessionId: string): boolean {
  if (!sessionId.startsWith('demo_')) return true;
  const timestamp = parseInt(sessionId.split('_')[1]);
  return Date.now() - timestamp > DEMO_SESSION_DURATION;
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/demo')) return 'demo';
    return 'local'; // Par défaut, mode local pour HDS
  });

  const [demoSessionId, setDemoSessionId] = useState<string>(() => {
    const existing = localStorage.getItem('demo-session-id');
    if (existing && !isDemoSessionExpired(existing)) {
      return existing;
    }
    return generateDemoSessionId();
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    
    if (newMode === 'demo' && !window.location.pathname.startsWith('/demo')) {
      // Créer nouvelle session démo
      const newSessionId = generateDemoSessionId();
      setDemoSessionId(newSessionId);
      localStorage.setItem('demo-session-id', newSessionId);
      window.location.href = '/demo';
    } else if (mode === 'demo' && newMode !== 'demo' && window.location.pathname.startsWith('/demo')) {
      window.location.href = '/dashboard';
    }
  };

  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/demo') && mode !== 'demo') {
        setModeState('demo');
      } else if (!path.startsWith('/demo') && mode === 'demo') {
        setModeState('local');
      }
    };

    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, [mode]);

  // Vérifier l'expiration de la session démo
  useEffect(() => {
    if (mode === 'demo') {
      const checkExpiration = () => {
        if (isDemoSessionExpired(demoSessionId)) {
          // Session expirée, créer une nouvelle
          const newSessionId = generateDemoSessionId();
          setDemoSessionId(newSessionId);
          localStorage.setItem('demo-session-id', newSessionId);
        }
      };

      const interval = setInterval(checkExpiration, 60000); // Vérifier toutes les minutes
      return () => clearInterval(interval);
    }
  }, [mode, demoSessionId]);

  const value: ModeContextType = {
    mode,
    setMode,
    isDemo: mode === 'demo',
    isLocal: mode === 'local',
    getDemoSessionId: () => demoSessionId,
    clearDemoSession: () => {
      localStorage.removeItem('demo-session-id');
      const newSessionId = generateDemoSessionId();
      setDemoSessionId(newSessionId);
      localStorage.setItem('demo-session-id', newSessionId);
    },
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}