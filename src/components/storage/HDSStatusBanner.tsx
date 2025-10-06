/**
 * Bannière d'information sur le statut du stockage HDS
 * Affiche des messages clairs sans bloquer l'application
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { isDemoSession } from '@/utils/demo-detection';
import { AlertTriangle, Shield, Settings, CheckCircle2 } from 'lucide-react';

export const HDSStatusBanner: React.FC = () => {
  const { status, isLoading } = useHybridStorage();
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = React.useState<boolean | null>(null);

  // Vérifier le mode démo - NE PAS afficher en mode démo
  React.useEffect(() => {
    const checkDemoMode = async () => {
      const demoMode = await isDemoSession();
      setIsDemoMode(demoMode);
    };
    checkDemoMode();
  }, []);

  // Ne rien afficher en mode démo ou pendant le chargement
  if (isDemoMode === null || isLoading || isDemoMode) {
    return null;
  }

  // Stockage configuré et déverrouillé - statut OK
  if (status?.isConfigured && status?.isUnlocked) {
    return (
      <Card className="mb-6 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Stockage HDS sécurisé configuré
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Vos données sensibles sont stockées localement et chiffrées
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Stockage configuré mais verrouillé
  if (status?.isConfigured && !status?.isUnlocked) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Stockage HDS verrouillé
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 break-words">
                Déverrouillez pour accéder aux données patients, rendez-vous et factures
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/settings/storage')}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20 w-full md:w-auto flex-shrink-0"
            >
              <Settings className="h-4 w-4 mr-1" />
              Déverrouiller
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Stockage non configuré - message informatif
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Stockage HDS sécurisé non configuré
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 break-words">
              Pour accéder aux fonctionnalités complètes (patients, rendez-vous, factures), 
              configurez le stockage local sécurisé conforme HDS.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
               <Button 
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem('hybrid-storage-skip');
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configurer maintenant
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.href = '/?demo=forced'}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 w-full sm:w-auto"
              >
                Mode démo
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};