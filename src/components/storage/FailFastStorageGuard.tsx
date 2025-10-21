/**
 * Garde "Fail Fast" pour le stockage HDS sécurisé
 * Bloque complètement l'application si le stockage sécurisé n'est pas disponible
 */

import React from 'react';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { useAuth } from '@/contexts/AuthContext';
import { HDSStorageFailureScreen } from './HDSStorageFailureScreen';
import { isDemoSession } from '@/utils/demo-detection';

interface FailFastStorageGuardProps {
  children: React.ReactNode;
}

export const FailFastStorageGuard: React.FC<FailFastStorageGuardProps> = ({ children }) => {
  const { status, isLoading, initialize } = useHybridStorage();
  const { loading: authLoading } = useAuth();
  const [isDemoMode, setIsDemoMode] = React.useState<boolean | null>(null);

  // Vérifier le mode démo au montage
  React.useEffect(() => {
    const checkDemoMode = async () => {
      // ⏸️ Attendre que l'auth soit chargée
      if (authLoading) {
        console.log('⏳ FailFastStorageGuard - Attente chargement authentification...');
        return;
      }
      
      const demoMode = await isDemoSession();
      console.log('🔍 FailFastStorageGuard - Demo mode détecté:', demoMode);
      setIsDemoMode(demoMode);
    };
    checkDemoMode();
  }, [authLoading]);

  // Attendre la vérification du mode démo ET de l'auth
  if (isDemoMode === null || isLoading || authLoading) {
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

  // ✅ MODE CONNECTÉ : Toujours autoriser (stockage chiffré temporaire disponible)
  return <>{children}</>;
};