import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHybridStorageContext } from '@/contexts/HybridStorageContext';
import { StorageWelcomeScreen } from '@/components/storage/StorageWelcomeScreen';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { FirstBackupPrompt } from '@/components/storage/FirstBackupPrompt';
import { toast } from 'sonner';
import { isDemoSession } from '@/utils/demo-detection';

const ConfigurationPage = () => {
  const navigate = useNavigate();
  const { isConfigured, isLoading, configureStorage } = useHybridStorageContext();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showFirstBackup, setShowFirstBackup] = useState(false);

  // Si déjà configuré, rediriger vers le dashboard
  useEffect(() => {
    const checkAndRedirect = async () => {
      const isDemo = await isDemoSession();
      if (isDemo || (isConfigured && !isLoading)) {
        navigate('/dashboard', { replace: true });
      }
    };
    
    checkAndRedirect();
  }, [isConfigured, isLoading, navigate]);

  const handleSkip = () => {
    localStorage.setItem('hds-storage-skip', 'true');
    toast.info("Configuration reportée. Vous pouvez la lancer depuis Paramètres > Stockage HDS.");
    navigate('/dashboard', { replace: true });
  };

  const handleStartConfiguration = () => {
    setShowWelcome(false);
    setShowSetup(true);
  };

  const handleComplete = async (config: any) => {
    try {
      await configureStorage(config);
      toast.success('Stockage HDS sécurisé configuré avec succès !');
      
      // Ne pas naviguer immédiatement - afficher le prompt de première sauvegarde
      setShowSetup(false);
      setShowFirstBackup(true);
    } catch (error) {
      console.error('Configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage sécurisé');
    }
  };

  const handleFirstBackupComplete = () => {
    setShowFirstBackup(false);
    toast.success('Configuration terminée ! Bienvenue sur PatientHub.');
    navigate('/dashboard', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showFirstBackup) {
    return (
      <FirstBackupPrompt
        isOpen={showFirstBackup}
        onComplete={handleFirstBackupComplete}
      />
    );
  }

  if (showSetup) {
    return (
      <SecureStorageSetup
        onComplete={handleComplete}
        onCancel={handleSkip}
      />
    );
  }

  return (
    <StorageWelcomeScreen
      onConfigure={handleStartConfiguration}
      onSkip={handleSkip}
    />
  );
};

export default ConfigurationPage;
