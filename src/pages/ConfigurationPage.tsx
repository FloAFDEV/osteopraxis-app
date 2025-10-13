import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHybridStorageContext } from '@/contexts/HybridStorageContext';
import { StorageWelcomeScreen } from '@/components/storage/StorageWelcomeScreen';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { toast } from 'sonner';
import { isDemoSession } from '@/utils/demo-detection';

const ConfigurationPage = () => {
  const navigate = useNavigate();
  const { isConfigured, isLoading, configureStorage } = useHybridStorageContext();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

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
    sessionStorage.setItem('hybrid-storage-skip', 'true');
    toast.info("Configuration du stockage local ignorée. L'application fonctionnera avec les données en ligne uniquement.");
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
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage sécurisé');
    }
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
