import React, { createContext, useContext, useEffect } from 'react';
import { useGlobalOptimization } from '@/hooks/useGlobalOptimization';

interface OptimizationContextType {
  data: {
    patients: any[];
    appointments: any[];
    cabinets: any[];
  };
  loading: {
    patients: boolean;
    appointments: boolean;
    cabinets: boolean;
    any: boolean;
    initializing: boolean;
  };
  optimize: {
    invalidateAll: () => void;
    invalidateRelated: (type: 'patient' | 'appointment' | 'cabinet') => void;
    preloadData: () => Promise<void>;
  };
  stats: {
    totalLoading: boolean;
    cacheHitRate: number;
    dataFreshness: {
      patients: string;
      appointments: string;
      cabinets: string;
    };
  };
}

const OptimizationContext = createContext<OptimizationContextType | null>(null);

export const OptimizationProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const optimization = useGlobalOptimization();

  // Préchargement automatique au démarrage
  useEffect(() => {
    const timer = setTimeout(() => {
      optimization.optimize.preloadData();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <OptimizationContext.Provider value={optimization}>
      {children}
    </OptimizationContext.Provider>
  );
};

export const useOptimization = () => {
  const context = useContext(OptimizationContext);
  if (!context) {
    throw new Error('useOptimization must be used within OptimizationProvider');
  }
  return context;
};

export default OptimizationProvider;