import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HybridStorageContextType {
  isConfigured: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  configureStorage: (config: any) => Promise<void>;
  unlockStorage: (credential: string) => Promise<boolean>;
  lockStorage: () => void;
}

const HybridStorageContext = createContext<HybridStorageContextType | undefined>(undefined);

export const useHybridStorageContext = () => {
  const context = useContext(HybridStorageContext);
  if (context === undefined) {
    throw new Error('useHybridStorageContext must be used within a HybridStorageProvider');
  }
  return context;
};

interface HybridStorageProviderProps {
  children: React.ReactNode;
}

export const HybridStorageProvider: React.FC<HybridStorageProviderProps> = ({ children }) => {
  const { isDemoMode } = useAuth();
  const [isLoading] = useState(false);

  const configureStorage = async (config: any): Promise<void> => {
    if (isDemoMode) return;
  };

  const unlockStorage = async (credential: string): Promise<boolean> => {
    if (isDemoMode) return true;
    return false;
  };

  const lockStorage = () => {
    if (isDemoMode) return;
  };

  const contextValue: HybridStorageContextType = {
    isConfigured: isDemoMode,
    isUnlocked: isDemoMode,
    isLoading,
    configureStorage,
    unlockStorage,
    lockStorage
  };

  return (
    <HybridStorageContext.Provider value={contextValue}>
      {children}
    </HybridStorageContext.Provider>
  );
};
