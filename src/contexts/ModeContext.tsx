import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'demo' | 'production' | 'local';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isDemo: boolean;
  isProduction: boolean;
  isLocal: boolean;
  getDemoData: () => any;
  clearDemoData: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

// Données de démonstration simplifiées
const demoData = {
  patients: [
    {
      id: 1,
      firstName: "Marie",
      lastName: "Dubois",
      email: "marie.dubois@demo.com",
      phone: "06 12 34 56 78",
      birthDate: "1985-06-15",
      address: "123 Rue de la Paix, 31000 Toulouse",
      gender: "FEMALE" as const,
      osteopathId: 1,
      cabinetId: 1,
      height: null,
      weight: null,
      bmi: null,
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: 2,
      firstName: "Jean",
      lastName: "Martin",
      email: "jean.martin@demo.com",
      phone: "06 98 76 54 32",
      birthDate: "1978-03-22",
      address: "456 Avenue de la République, 31100 Toulouse",
      gender: "MALE" as const,
      osteopathId: 1,
      cabinetId: 1,
      height: null,
      weight: null,
      bmi: null,
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
    }
  ],
  appointments: [
    {
      id: 1,
      patientId: 1,
      cabinetId: 1,
      osteopathId: 1,
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      reason: "Douleurs lombaires",
      status: "SCHEDULED" as const,
      notes: "Première consultation",
      notificationSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  invoices: [
    {
      id: 1,
      patientId: 1,
      osteopathId: 1,
      appointmentId: 1,
      amount: 60,
      date: new Date().toISOString(),
      paymentStatus: "PAID" as const,
      paymentMethod: "Espèces",
      notes: "Consultation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      patientId: 2,
      osteopathId: 1,
      amount: 55,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: "PENDING" as const,
      notes: "Consultation de suivi",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/demo')) return 'demo';
    
    const saved = localStorage.getItem('app-mode');
    return (saved as AppMode) || 'production';
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('app-mode', newMode);
    
    if (newMode === 'demo' && !window.location.pathname.startsWith('/demo')) {
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
        const saved = localStorage.getItem('app-mode');
        setModeState((saved as AppMode) || 'production');
      }
    };

    window.addEventListener('popstate', handlePathChange);
    return () => window.removeEventListener('popstate', handlePathChange);
  }, [mode]);

  const value: ModeContextType = {
    mode,
    setMode,
    isDemo: mode === 'demo',
    isProduction: mode === 'production',
    isLocal: mode === 'local',
    getDemoData: () => demoData,
    clearDemoData: () => console.log('Demo data cleared'),
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}