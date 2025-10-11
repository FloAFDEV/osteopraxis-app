import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hdsSecureManager, type HDSSecureConfig } from '@/services/hds-secure-storage/hds-secure-manager';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
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
      // Vérifier si on est en mode démo pour éviter la configuration
      const checkDemoMode = async () => {
        try {
          const { isDemoSession } = await import('@/utils/demo-detection');
          const demoMode = await isDemoSession();
          
          if (demoMode) {
            console.log('🎭 Mode démo détecté - Pas de configuration stockage nécessaire');
            return;
          }
          
          // En mode connecté, proposer la configuration si pas encore fait
          if (!status.isConfigured && !skipped) {
            console.log('⚙️ Configuration stockage HDS sécurisé disponible');
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
        } catch (error) {
          console.error('Erreur vérification mode démo:', error);
          // En cas d'erreur, procéder comme en mode normal
          if (!status.isConfigured && !skipped) {
            setShowSetup(true);
          }
        }
      };
      
      checkDemoMode();
    }
  }, [isLoading, status, skipped]);

  const configureStorage = async (config: any): Promise<void> => {
    try {
      // Nouvelle configuration HDS sécurisée
      const secureConfig: HDSSecureConfig = {
        directoryHandle: config.directoryHandle,
        password: config.password,
        entities: ['patients', 'appointments', 'invoices']
      };
      
      await hdsSecureManager.configure(secureConfig);
      setShowSetup(false);
      setShowUnlock(false);
      await initialize();
      
      toast.success('Stockage HDS sécurisé configuré avec succès !');
    } catch (error) {
      console.error('Secure storage configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage sécurisé');
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
    toast.info("Configuration du stockage local ignorée. L'application fonctionnera avec les données en ligne uniquement. Vous pourrez configurer le stockage local plus tard dans Paramètres > Stockage.");
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
      <SecureStorageSetup
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