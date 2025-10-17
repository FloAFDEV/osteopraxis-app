/**
 * Garde "Fail Fast" pour le stockage HDS sécurisé
 * Bloque complètement l'application si le stockage sécurisé n'est pas disponible
 */

import React from 'react';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { HDSStorageFailureScreen } from './HDSStorageFailureScreen';
import { isDemoSession } from '@/utils/demo-detection';

interface FailFastStorageGuardProps {
  children: React.ReactNode;
}

export const FailFastStorageGuard: React.FC<FailFastStorageGuardProps> = ({ children }) => {
  const { status, isLoading, initialize } = useHybridStorage();
  const [isDemoMode, setIsDemoMode] = React.useState<boolean | null>(null);

  // Vérifier le mode démo au montage
  React.useEffect(() => {
    const checkDemoMode = async () => {
      const demoMode = await isDemoSession();
      setIsDemoMode(demoMode);
    };
    checkDemoMode();
  }, []);

  // Attendre la vérification du mode démo
  if (isDemoMode === null || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Vérification du stockage sécurisé...</p>
        </div>
      </div>
    );
  }

  // En mode démo, laisser passer sans vérification
  if (isDemoMode) {
    return <>{children}</>;
  }

  // 🔒 MODE CONNECTÉ : Bloquer si HDS non configuré
  if (!status.isConfigured || !status.isUnlocked) {
    console.warn('🚨 Accès bloqué : Configuration HDS obligatoire');
    return (
      <HDSStorageFailureScreen 
        error="Configuration du stockage sécurisé obligatoire pour accéder aux données patients"
        onRetry={initialize}
      />
    );
  }

  // ✅ HDS configuré ET déverrouillé : Laisser passer
  return <>{children}</>;
};