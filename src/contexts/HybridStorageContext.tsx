import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nativeStorageManager, type NativeStorageConfig } from '@/services/native-file-storage/native-storage-manager';
import { LocalStorageSetup } from '@/components/storage/LocalStorageSetup';
import { StorageUnlockPrompt } from '@/components/storage/StorageUnlockPrompt';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { toast } from 'sonner';

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
  const { status, isLoading, initialize, unlock, lock } = useHybridStorage();
  const [showSetup, setShowSetup] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [securityMethod, setSecurityMethod] = useState<'pin' | 'password'>('password');
  const navigate = useNavigate();
  const [skipped, setSkipped] = useState<boolean>(() => sessionStorage.getItem('hybrid-storage-skip') === 'true');
  
  useEffect(() => {
    if (!isLoading && status) {
      if (!status.isConfigured && !skipped) {
        setShowSetup(true);
      } else if (status.isConfigured && !status.isUnlocked && !skipped) {
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
  }, [isLoading, status, skipped]);

  const configureStorage = async (config: any): Promise<void> => {
    try {
      // Convertir la config LocalStorageSetup vers NativeStorageConfig
      const nativeConfig: NativeStorageConfig = {
        encryptionKey: config.credential,
        entities: ['patients', 'appointments', 'invoices']
      };
      
      await nativeStorageManager.configure(nativeConfig);
      setShowSetup(false);
      setShowUnlock(false);
      await initialize();
      
      toast.success('Configuration de stockage local réussie !');
    } catch (error: any) {
      console.error('Storage configuration failed:', error);
      
      // Si c'est une restriction iframe, on propose l'OPFS automatiquement
      if (error.message?.includes('IFRAME_RESTRICTION')) {
        console.log('🔄 Basculement automatique vers OPFS suite à restriction iframe...');
        toast.info('Basculement automatique vers le stockage OPFS (environnement de développement)');
        
        // Essayer d'initialiser avec OPFS
        try {
          await initialize();
          setShowSetup(false);
          setShowUnlock(false);
          toast.success('Stockage OPFS configuré avec succès !');
          return;
        } catch (opfsError) {
          console.error('OPFS fallback failed:', opfsError);
        }
      }
      
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

  const handleCancel = () => {
    sessionStorage.setItem('hybrid-storage-skip', 'true');
    setSkipped(true);
    setShowSetup(false);
    setShowUnlock(false);
    toast.info("Configuration du stockage local ignorée pour l'instant. Certaines fonctionnalités hors-ligne peuvent être désactivées. Vous pourrez la configurer plus tard dans Paramètres > Stockage.");
    try { navigate('/'); } catch {}
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
        onCancel={handleCancel}
      />
    );
  }

  if (showUnlock) {
    return (
      <StorageUnlockPrompt
        securityMethod={securityMethod}
        onUnlock={() => setShowUnlock(false)}
        onCancel={handleCancel}
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