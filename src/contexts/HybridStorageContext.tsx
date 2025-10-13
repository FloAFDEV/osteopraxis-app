import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hdsSecureManager, type HDSSecureConfig } from '@/services/hds-secure-storage/hds-secure-manager';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { StorageUnlockPrompt } from '@/components/storage/StorageUnlockPrompt';
import { StorageWelcomeScreen } from '@/components/storage/StorageWelcomeScreen';
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
  const [showUnlock, setShowUnlock] = useState(false);
  const [securityMethod, setSecurityMethod] = useState<'pin' | 'password'>('password');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && status) {
      // Vérifier si le stockage est configuré mais verrouillé
      const checkUnlockNeeded = async () => {
        try {
          const { isDemoSession } = await import('@/utils/demo-detection');
          const demoMode = await isDemoSession();
          const skipped = sessionStorage.getItem('hybrid-storage-skip') === 'true';
          
          if (demoMode) {
            console.log('🎭 Mode démo détecté - Pas de déverrouillage nécessaire');
            return;
          }
          
          // Si configuré mais verrouillé, afficher le prompt de déverrouillage
          if (status.isConfigured && !status.isUnlocked && !skipped) {
            const config = localStorage.getItem('hybrid-storage-config');
            if (config) {
              try {
                const parsedConfig = JSON.parse(config);
                setSecurityMethod(parsedConfig.securityMethod || 'password');
              } catch {
                setSecurityMethod('password');
              }
            }
            setShowUnlock(true);
          }
        } catch (error) {
          console.error('Erreur vérification mode démo:', error);
        }
      };
      
      checkUnlockNeeded();
    }
  }, [isLoading, status]);

  const configureStorage = async (config: any): Promise<void> => {
    try {
      // Nouvelle configuration HDS sécurisée avec OPFS automatique
      const secureConfig: HDSSecureConfig = {
        password: config.password,
        entities: ['patients', 'appointments', 'invoices']
      };
      
      await hdsSecureManager.configure(secureConfig);
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

  const handleSkip = () => {
    sessionStorage.setItem('hybrid-storage-skip', 'true');
    setShowUnlock(false);
    toast.info("Stockage local non déverrouillé. L'application fonctionnera avec les données en ligne uniquement.");
    try { navigate('/dashboard'); } catch {}
  };

  if (showUnlock) {
    return (
      <StorageUnlockPrompt
        securityMethod={securityMethod}
        onUnlock={() => setShowUnlock(false)}
        onCancel={handleSkip}
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