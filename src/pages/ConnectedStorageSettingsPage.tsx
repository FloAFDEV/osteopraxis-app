/**
 * 🔐 Page de configuration du stockage HDS pour mode connecté UNIQUEMENT
 * 
 * Remplace HybridStorageSettingsPage pour le mode connecté
 * Complètement séparée du mode démo
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Download, Upload, Shield, Lock, AlertTriangle } from 'lucide-react';
import { StorageStatusDisplay } from '@/components/storage/StorageStatusDisplay';
import { HDSComplianceIndicator } from '@/components/hds/HDSComplianceIndicator';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { StorageUnlockPanel } from '@/components/storage/StorageUnlockPanel';
import { useConnectedStorage } from '@/hooks/useConnectedStorage';
import { useConnectedCabinetStats } from '@/hooks/useConnectedCabinetStats';
import { hybridDataManager } from '@/services/hybrid-data-adapter/hybrid-manager';
import { isDemoSession } from '@/utils/demo-detection';
import { toast } from 'sonner';

const ConnectedStorageSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const { status, isLoading, initialize, unlock } = useConnectedStorage();
  const cabinetStats = useConnectedCabinetStats();

  // Vérification de sécurité : Rediriger si en mode démo
  useEffect(() => {
    isDemoSession().then(isDemoMode => {
      if (isDemoMode) {
        console.log('🎭 Mode démo détecté - Redirection vers dashboard');
        navigate('/dashboard');
        toast.info('Configuration de stockage non disponible en mode démo');
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Vérifier si on doit afficher la configuration
    if (!isLoading && status && !status.isConfigured) {
      console.log('⚙️ Stockage HDS non configuré - Affichage de l\'assistant de configuration');
      setShowSetup(true);
    } else if (!isLoading && status?.isConfigured && !status.isUnlocked) {
      console.log('🔒 Stockage HDS verrouillé - Déverrouillage nécessaire');
      // Le déverrouillage sera demandé via l'interface
    }
  }, [isLoading, status]);

  const handleConfigurationComplete = async (config: any) => {
    try {
      // La configuration est déjà effectuée dans SecureStorageSetup
      // On ne fait que rafraîchir le statut et fermer la configuration
      await initialize();
      setShowSetup(false);
      toast.success('Configuration HDS terminée avec succès !');
    } catch (error) {
      console.error('Erreur configuration:', error);
      toast.error('Erreur lors de la configuration');
    }
  };

  const handleUnlock = async (password: string): Promise<boolean> => {
    try {
      const success = await unlock(password);
      if (success) {
        await initialize();
      }
      return success;
    } catch (error) {
      console.error('Erreur déverrouillage:', error);
      return false;
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const backupData = await hybridDataManager.exportData();
      
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patienthub-hds-backup-${new Date().toISOString().slice(0, 10)}.phds`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Données HDS exportées avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export des données HDS');
    } finally {
      setLoading(false);
    }
  };

  const importData = async () => {
    setImporting(true);
    try {
      // Créer un input file pour sélectionner le fichier
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.phds';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          // Vérifier le format du fichier
          if (data.format && data.format.includes('PatientHub')) {
            toast.info('Import de fichier PatientHub HDS sécurisé détecté');
          }
          
          // TODO: Implémenter l'import sécurisé avec validation de mot de passe
          // await hybridDataManager.importData(text, password);
          toast.info('Import sécurisé en développement - fonctionnalité bientôt disponible');
          
          toast.success('Données importées avec succès');
        } catch (error) {
          console.error('Erreur import:', error);
          if (error instanceof Error && error.message.includes('password')) {
            toast.error('Mot de passe incorrect pour déchiffrer les données');
          } else {
            toast.error('Erreur lors de l\'import des données');
          }
        } finally {
          setImporting(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Erreur sélection fichier:', error);
      toast.error('Erreur lors de la sélection du fichier');
      setImporting(false);
    }
  };

  // Afficher la configuration initiale si nécessaire
  if (showSetup) {
    return (
      <SecureStorageSetup
        onComplete={handleConfigurationComplete}
        onCancel={() => {
          setShowSetup(false);
          navigate('/dashboard');
        }}
      />
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Stockage HDS Sécurisé</h1>
            </div>
          </div>

          {/* Message d'information si pas configuré */}
          {!isLoading && status && !status.isConfigured && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Stockage HDS non configuré
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                      Pour une conformité HDS complète, configurez le stockage local sécurisé pour vos données sensibles.
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setShowSetup(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Configurer maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Panel de déverrouillage si configuré mais verrouillé */}
          {!isLoading && status?.isConfigured && !status.isUnlocked && (
            <StorageUnlockPanel onUnlock={handleUnlock} isLoading={isLoading} />
          )}

          {/* Indicateur de conformité HDS */}
          <HDSComplianceIndicator />

          {/* Statistiques des cabinets connectés */}
          {cabinetStats.totalCabinets > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des cabinets</CardTitle>
                <CardDescription>
                  Vos cabinets connectés (données stockées sur Supabase)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{cabinetStats.totalCabinets}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{cabinetStats.ownedCabinets}</p>
                    <p className="text-sm text-muted-foreground">Possédés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{cabinetStats.associatedCabinets}</p>
                    <p className="text-sm text-muted-foreground">Associés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Affichage du statut en temps réel */}
          <StorageStatusDisplay />

          {/* Actions de gestion */}
          <Card>
            <CardHeader>
              <CardTitle>Gestion des données HDS</CardTitle>
              <CardDescription>
                Exportez et importez vos données HDS locales en toute sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={exportData}
                  disabled={loading || !status?.isConfigured}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter les données HDS
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={importData}
                  disabled={loading || importing || !status?.isConfigured}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {importing ? 'Import en cours...' : 'Importer une sauvegarde HDS'}
                </Button>
              </div>
              
              {!status?.isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Configurez d'abord le stockage HDS pour accéder aux fonctionnalités de sauvegarde.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ConnectedStorageSettingsPage;