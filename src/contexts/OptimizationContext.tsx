import React, { createContext, useContext, useState } from 'react';

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
  // État simplifié sans hooks supprimés
  const [loading] = useState({
    patients: false,
    appointments: false,
    cabinets: false,
    any: false,
    initializing: false,
  });

  const optimization: OptimizationContextType = {
    data: {
      patients: [],
      appointments: [],
      cabinets: [],
    },
    loading,
    optimize: {
      invalidateAll: () => {},
      invalidateRelated: () => {},
      preloadData: async () => {},
    },
    stats: {
      totalLoading: false,
      cacheHitRate: 0,
      dataFreshness: {
        patients: 'fresh',
        appointments: 'fresh',
        cabinets: 'fresh',
      },
    },
  };

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