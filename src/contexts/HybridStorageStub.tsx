/**
 * 🔄 Stub pour HybridStorageContext
 * 
 * Ce fichier remplace l'ancien HybridStorageContext qui était lié à hybrid-data-adapter.
 * En mode démo : aucune initialisation HDS nécessaire.
 * En mode connecté : le routage se fait automatiquement via StorageRouter.
 */

import React, { createContext, useContext } from 'react';
import { useDemo } from '@/contexts/DemoContext';

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
  const { isDemoMode } = useDemo();

  const contextValue: HybridStorageContextType = {
    // En mode démo : toujours configuré et déverrouillé (utilise Supabase)
    // En mode connecté : déléguer au StorageRouter
    isConfigured: true,
    isUnlocked: true,
    isLoading: false,
    
    configureStorage: async () => {
      console.log('📦 HybridStorage stub: configuration ignorée (routage via StorageRouter)');
    },
    
    unlockStorage: async () => {
      console.log('🔓 HybridStorage stub: déverrouillage ignoré (routage via StorageRouter)');
      return true;
    },
    
    lockStorage: () => {
      console.log('🔒 HybridStorage stub: verrouillage ignoré (routage via StorageRouter)');
    }
  };

  return (
    <HybridStorageContext.Provider value={contextValue}>
      {children}
    </HybridStorageContext.Provider>
  );
};