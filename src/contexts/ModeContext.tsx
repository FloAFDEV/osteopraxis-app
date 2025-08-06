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

interface ModeProviderProps {
  children: ReactNode;
}

// Données fictives pour le mode démo
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
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: 3,
      firstName: "Sophie",
      lastName: "Lemoine",
      email: "sophie.lemoine@demo.com",
      phone: "06 45 67 89 01",
      birthDate: "1992-11-08",
      address: "789 Boulevard Victor Hugo, 31200 Toulouse",
      gender: "FEMALE" as const,
      osteopathId: 1,
      createdAt: new Date('2024-02-05').toISOString(),
      updatedAt: new Date('2024-02-05').toISOString(),
    }
  ],
  appointments: [
    {
      id: 1,
      patientId: 1,
      osteopathId: 1,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
      reason: "Douleurs lombaires",
      status: "SCHEDULED" as const,
      notes: "Première consultation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      patientId: 2,
      osteopathId: 1,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
      reason: "Suivi post-traitement",
      status: "SCHEDULED" as const,
      notes: "Contrôle après 2 semaines",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      patientId: 1,
      osteopathId: 1,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Il y a une semaine
      reason: "Douleurs cervicales",
      status: "COMPLETED" as const,
      notes: "Séance terminée avec succès",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  invoices: [
    {
      id: 1,
      patientId: 1,
      osteopathId: 1,
      appointmentId: 3,
      amount: 60,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: "PAID" as const,
      paymentMethod: "Espèces",
      notes: "Première consultation",
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
  ],
  osteopath: {
    id: 1,
    name: "Dr. Dupont",
    professional_title: "Ostéopathe D.O.",
    rpps_number: "12345678901",
    siret: "12345678901234",
    authId: "demo-user-id",
    userId: "demo-user-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  cabinet: {
    id: 1,
    name: "Cabinet Ostéopathique Demo",
    address: "123 Rue de la Santé, 31000 Toulouse",
    phone: "05 61 12 34 56",
    email: "contact@cabinet-demo.fr",
    osteopathId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setModeState] = useState<AppMode>(() => {
    // Déterminer le mode initial selon l'URL ou le localStorage
    const path = window.location.pathname;
    if (path.startsWith('/demo')) {
      return 'demo';
    }
    
    const savedMode = localStorage.getItem('app-mode');
    if (savedMode && ['demo', 'production', 'local'].includes(savedMode)) {
      return savedMode as AppMode;
    }
    
    return 'production'; // Mode par défaut
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('app-mode', newMode);
    
    // Si on passe en mode démo, rediriger vers /demo
    if (newMode === 'demo' && !window.location.pathname.startsWith('/demo')) {
      window.location.href = '/demo';
    }
    // Si on quitte le mode démo, rediriger vers /dashboard
    else if (mode === 'demo' && newMode !== 'demo' && window.location.pathname.startsWith('/demo')) {
      window.location.href = '/dashboard';
    }
  };

  const getDemoData = () => {
    return demoData;
  };

  const clearDemoData = () => {
    // Dans le mode démo, les données ne sont pas persistées
    console.log('Demo data cleared (no persistence in demo mode)');
  };

  // Surveiller les changements d'URL pour ajuster le mode
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/demo') && mode !== 'demo') {
        setModeState('demo');
      } else if (!path.startsWith('/demo') && mode === 'demo') {
        const savedMode = localStorage.getItem('app-mode');
        if (savedMode && savedMode !== 'demo') {
          setModeState(savedMode as AppMode);
        } else {
          setModeState('production');
        }
      }
    };

    // Écouter les changements de navigation
    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, [mode]);

  const value: ModeContextType = {
    mode,
    setMode,
    isDemo: mode === 'demo',
    isProduction: mode === 'production',
    isLocal: mode === 'local',
    getDemoData,
    clearDemoData,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}