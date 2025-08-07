import React, { createContext, useContext, useEffect, useState } from 'react';
import { hybridStorageManager, type StorageConfig } from '@/services/hybrid-storage-manager';
import { LocalStorageSetup } from '@/components/storage/LocalStorageSetup';
import { StorageUnlockPrompt } from '@/components/storage/StorageUnlockPrompt';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { toast } from 'sonner';

interface HybridStorageContextType {
  isConfigured: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  configureStorage: (config: StorageConfig) => Promise<void>;
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
  const { status, isLoading, initialize, unlock, lock } = useHybridStorage();
  const [showSetup, setShowSetup] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [securityMethod, setSecurityMethod] = useState<'pin' | 'password'>('password');

  useEffect(() => {
    if (!isLoading && status) {
      if (!status.isConfigured) {
        setShowSetup(true);
      } else if (!status.isUnlocked) {
        // Charger la méthode de sécurité depuis la configuration
        const config = localStorage.getItem('hybrid-storage-config');
        if (config) {
          try {
            const parsedConfig = JSON.parse(config);
            setSecurityMethod(parsedConfig.securityMethod || 'password');
          } catch {
            // Fallback
            setSecurityMethod('password');
          }
        }
        setShowUnlock(true);
      }
    }
  }, [isLoading, status]);

  const configureStorage = async (config: StorageConfig): Promise<void> => {
    try {
      await hybridStorageManager.configureStorage(config);
      setShowSetup(false);
      setShowUnlock(false);
      await initialize();
      toast.success('Configuration de stockage terminée');
    } catch (error) {
      console.error('Storage configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage');
      throw error;
    }
  };

  const unlockStorage = async (credential: string): Promise<boolean> => {
    try {
      const success = await unlock(credential);
      if (success) {
        setShowUnlock(false);
      }
      return success;
    } catch (error) {
      console.error('Storage unlock failed:', error);
      return false;
    }
  };

  const lockStorage = () => {
    lock();
    setShowUnlock(true);
  };

  // Affichage conditionnel des modales
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Initialisation du stockage hybride...</p>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <LocalStorageSetup
        onComplete={configureStorage}
        onCancel={() => {
          // En mode obligatoire, on ne peut pas annuler
          toast.warning('La configuration du stockage local est obligatoire');
        }}
      />
    );
  }

  if (showUnlock) {
    return (
      <StorageUnlockPrompt
        securityMethod={securityMethod}
        onUnlock={() => setShowUnlock(false)}
        onCancel={() => {
          // En mode obligatoire, on ne peut pas annuler
          toast.warning('Le déverrouillage du stockage est obligatoire');
        }}
      />
    );
  }

  const contextValue: HybridStorageContextType = {
    isConfigured: status?.isConfigured || false,
    isUnlocked: status?.isUnlocked || false,
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