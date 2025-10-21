import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hdsSecureManager, type HDSSecureConfig } from '@/services/hds-secure-storage/hds-secure-manager';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { StorageUnlockPrompt } from '@/components/storage/StorageUnlockPrompt';
import { StoragePasswordRecovery } from '@/components/storage/StoragePasswordRecovery';
import { StorageWelcomeScreen } from '@/components/storage/StorageWelcomeScreen';
import { TemporaryStoragePinSetup } from '@/components/storage/TemporaryStoragePinSetup';
import { TemporaryStoragePinUnlock } from '@/components/storage/TemporaryStoragePinUnlock';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { useAuth } from '@/contexts/AuthContext';
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
  const { status, isLoading, initialize, unlock, lock, loadStatus } = useHybridStorage();
  const { user, loading: authLoading } = useAuth();
  const [showUnlock, setShowUnlock] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinUnlock, setShowPinUnlock] = useState(false);
  const [securityMethod, setSecurityMethod] = useState<'pin' | 'password'>('password');
  const navigate = useNavigate();
  
  useEffect(() => {
    // ⏸️ Attendre que l'authentification soit chargée
    if (authLoading) {
      console.log('⏳ HybridStorageContext - Attente chargement authentification...');
      return;
    }

    if (!isLoading && status) {
      const checkStorageStatus = async () => {
        try {
          const { isDemoSession } = await import('@/utils/demo-detection');
          const demoMode = await isDemoSession();
          const skipped = localStorage.getItem('hds-storage-skip') === 'true';
          
          console.log('🔍 HybridStorageContext - Check storage:', { demoMode, userEmail: user?.email, skipped });
          
          if (demoMode) {
            console.log('🎭 Mode démo détecté - Pas de configuration nécessaire');
            return;
          }
          
          const pinHash = localStorage.getItem('temp-storage-pin-hash');
          const hdsConfigured = status.isConfigured;
          
          // Si HDS pas configuré ET pas de PIN temporaire
          if (!hdsConfigured && !pinHash && !skipped) {
            console.log('🔐 Configuration PIN temporaire requise');
            setShowPinSetup(true);
            return;
          }
          
          // Si PIN configuré mais pas déverrouillé
          if (!hdsConfigured && pinHash && !skipped) {
            const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
            const isUnlocked = await encryptedWorkingStorage.isAvailable();
            
            if (!isUnlocked) {
              console.log('🔓 Déverrouillage PIN requis');
              setShowPinUnlock(true);
              return;
            }
          }
          
          // Si HDS configuré mais verrouillé
          if (hdsConfigured && !status.isUnlocked && !skipped) {
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
          console.error('Erreur vérification stockage:', error);
        }
      };
      
      checkStorageStatus();
    }
  }, [authLoading, isLoading, status, user]);

  const configureStorage = async (config: any): Promise<void> => {
    try {
      // Nouvelle configuration HDS sécurisée avec OPFS automatique
      const secureConfig: HDSSecureConfig = {
        password: config.password,
        entities: ['patients', 'appointments', 'invoices']
      };
      
      // 🧹 ÉTAPE 2 : Nettoyer les données de sélection précédentes pour éviter les fuites multi-tenant
      console.log('🧹 [HybridStorage] Nettoyage du localStorage lors de la configuration HDS');
      localStorage.removeItem('selectedCabinetId');
      
      await hdsSecureManager.configure(secureConfig);
      await initialize();
      
      // Forcer un refresh pour mettre à jour le statut
      if (loadStatus) {
        await loadStatus();
      }
      
      // 🔄 MIGRATION AUTOMATIQUE DES DONNÉES TEMPORAIRES CHIFFRÉES
      const pinHash = localStorage.getItem('temp-storage-pin-hash');
      if (pinHash) {
        const pin = prompt('Entrez votre code PIN pour migrer vos données temporaires vers HDS :');
        if (pin) {
          try {
            const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
            await encryptedWorkingStorage.configureWithPin(pin);
            
            const tempInfo = await encryptedWorkingStorage.getStorageInfo();
            const hasData = tempInfo.totalSize > 0;
            
            if (hasData) {
              console.log('📦 Migration des données chiffrées vers HDS...');
              
              // Export depuis temporaire
              const backup = await encryptedWorkingStorage.exportBackup();
              
              // Import dans HDS
              const file = new File([backup], 'temp-migration.hdsbackup');
              await hdsSecureManager.importAllSecure(file, config.password, 'merge');
              
              // Nettoyer le temporaire
              for (const entity of ['patients', 'appointments', 'invoices']) {
                const all = await encryptedWorkingStorage.getAll(entity);
                for (const item of all) {
                  await encryptedWorkingStorage.delete(entity, (item as any).id);
                }
              }
              
              localStorage.removeItem('temp-storage-pin-hash');
              toast.success('Migration terminée - Stockage temporaire supprimé');
            }
          } catch (error) {
            console.error('Erreur migration:', error);
            toast.error('Erreur lors de la migration. Vos données temporaires sont conservées.');
          }
        }
      }
      
      // 🆘 MIGRATION AUTOMATIQUE DES DONNÉES SURVIVANTES (ancien système)
      const { survivalStorage } = await import('@/services/storage/survival-storage');
      if (survivalStorage.hasSurvivalData()) {
        const stats = survivalStorage.getSurvivalDataStats();
        console.log('🔄 Migration des données survivantes vers HDS sécurisé:', stats);
        toast.info(`Migration de ${stats.patients} patients, ${stats.appointments} rendez-vous et ${stats.invoices} factures...`);
        
        try {
          const { hdsSecurePatientService, hdsSecureAppointmentService, hdsSecureInvoiceService } = 
            await import('@/services/hds-secure-storage');
          
          // Migrer patients
          const patients = survivalStorage.getPatients();
          for (const patient of patients) {
            await hdsSecurePatientService.createPatient(patient);
          }
          
          // Migrer appointments
          const appointments = survivalStorage.getAppointments();
          for (const appointment of appointments) {
            await hdsSecureAppointmentService.createAppointment(appointment);
          }
          
          // Migrer invoices
          const invoices = survivalStorage.getInvoices();
          for (const invoice of invoices) {
            await hdsSecureInvoiceService.createInvoice(invoice);
          }
          
          // Nettoyer le stockage survivant
          survivalStorage.clearSurvivalData();
          
          toast.success(`Migration terminée : ${stats.patients} patients, ${stats.appointments} rendez-vous et ${stats.invoices} factures sécurisés !`);
        } catch (migrationError) {
          console.error('Erreur lors de la migration:', migrationError);
          toast.error('Erreur lors de la migration des données. Vos données temporaires sont conservées.');
        }
      }
      
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
    localStorage.setItem('hds-storage-skip', 'true');
    setShowUnlock(false);
    toast.info("Configuration du stockage HDS ignorée. Vous pouvez la réactiver depuis Paramètres > Stockage HDS.");
    try { navigate('/dashboard'); } catch {}
  };

  const handlePasswordForgotten = () => {
    setShowUnlock(false);
    setShowRecovery(true);
  };

  const handlePinSetup = async (pin: string) => {
    try {
      const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
      await encryptedWorkingStorage.configureWithPin(pin);
      setShowPinSetup(false);
      toast.success('Stockage temporaire configuré. Vos données sont chiffrées.');
      try { navigate('/dashboard'); } catch {}
    } catch (error) {
      console.error('Erreur configuration PIN:', error);
      toast.error('Erreur lors de la configuration');
    }
  };

  const handleRecoveryComplete = async () => {
    setShowRecovery(false);
    await initialize();
    toast.success('Récupération terminée ! Accès aux données restauré.');
    try { navigate('/dashboard'); } catch {}
  };

  if (showPinSetup) {
    return <TemporaryStoragePinSetup onComplete={handlePinSetup} />;
  }

  if (showPinUnlock) {
    return (
      <TemporaryStoragePinUnlock
        onUnlock={() => setShowPinUnlock(false)}
        onForgot={handlePasswordForgotten}
      />
    );
  }

  if (showUnlock) {
    return (
      <StorageUnlockPrompt
        securityMethod={securityMethod}
        onUnlock={() => setShowUnlock(false)}
        onCancel={handleSkip}
        onPasswordForgotten={handlePasswordForgotten}
      />
    );
  }

  if (showRecovery) {
    return (
      <StoragePasswordRecovery
        isOpen={showRecovery}
        onClose={() => {
          setShowRecovery(false);
          setShowUnlock(true);
        }}
        onRecoveryComplete={handleRecoveryComplete}
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