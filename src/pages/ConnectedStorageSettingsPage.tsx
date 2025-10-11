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
import { ArrowLeft, Settings, Download, Upload, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { StorageStatusDisplay } from '@/components/storage/StorageStatusDisplay';
import { HDSComplianceIndicator } from '@/components/hds/HDSComplianceIndicator';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { StorageUnlockPanel } from '@/components/storage/StorageUnlockPanel';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { useConnectedCabinetStats } from '@/hooks/useConnectedCabinetStats';
import { hdsSecureManager } from '@/services/hds-secure-storage/hds-secure-manager';
import { isDemoSession } from '@/utils/demo-detection';
import { SecurityConfirmationDialog } from '@/components/security/SecurityConfirmationDialog';
import { ExportReminderDialog } from '@/components/storage/ExportReminderDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const ConnectedStorageSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const { status, isLoading, initialize, unlock } = useHybridStorage();
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

  const handleExportRequest = () => {
    setShowExportConfirm(true);
  };

  const confirmExport = async () => {
    setLoading(true);
    setShowExportConfirm(false);
    try {
      await hdsSecureManager.exportAllSecure();
      toast.success('Données HDS exportées avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export des données HDS');
    } finally {
      setLoading(false);
    }
  };

  const handleImportRequest = () => {
    // Créer un input file pour sélectionner le fichier
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.phds';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setPendingImportFile(file);
        setShowImportConfirm(true);
      }
    };
    
    input.click();
  };

  const confirmImport = async () => {
    if (!pendingImportFile) return;
    
    setShowImportConfirm(false);
    setShowPasswordDialog(true);
  };

  const executeImport = async () => {
    if (!pendingImportFile || !importPassword) {
      toast.error('Fichier ou mot de passe manquant');
      return;
    }

    setImporting(true);
    setShowPasswordDialog(false);
    
    try {
      const result = await hdsSecureManager.importAllSecure(
        pendingImportFile, 
        importPassword, 
        'merge'
      );
      
      if (result.errors.length === 0) {
        toast.success(`Import réussi : ${Object.values(result.imported).reduce((a, b) => a + b, 0)} enregistrement(s) importé(s)`);
        
        if (result.warnings.length > 0) {
          console.warn('Avertissements import:', result.warnings);
          toast.warning(`${result.warnings.length} avertissement(s) - voir la console`);
        }
        
        await initialize();
      } else {
        toast.error('Échec de l\'import');
        console.error('Erreurs import:', result.errors);
      }
    } catch (error) {
      console.error('Erreur import:', error);
      if (error instanceof Error && error.message.includes('password')) {
        toast.error('Mot de passe incorrect pour déchiffrer les données');
      } else {
        toast.error('Erreur lors de l\'import des données');
      }
    } finally {
      setImporting(false);
      setImportPassword('');
      setPendingImportFile(null);
    }
  };

  const handleResetRequest = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    if (resetConfirmText !== 'SUPPRIMER') {
      toast.error('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    try {
      await hdsSecureManager.reset();
      setShowResetConfirm(false);
      setResetConfirmText('');
      toast.success('Stockage HDS réinitialisé avec succès');
      
      // Réinitialiser et afficher la configuration
      await initialize();
      setShowSetup(true);
    } catch (error) {
      console.error('Erreur reset:', error);
      toast.error('Erreur lors de la réinitialisation du stockage');
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
                  onClick={handleExportRequest}
                  disabled={loading || !status?.isConfigured || !status?.isUnlocked}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter les données HDS
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleImportRequest}
                  disabled={loading || importing || !status?.isConfigured || !status?.isUnlocked}
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

          {/* Zone dangereuse - Reset */}
          {status?.isConfigured && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Zone dangereuse</CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre stockage HDS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <p className="font-bold mb-2">Mot de passe oublié ?</p>
                    <p className="text-sm">
                      Si vous avez perdu votre mot de passe, la seule option est de réinitialiser 
                      complètement le stockage HDS. <strong>Toutes vos données locales seront définitivement perdues</strong>.
                    </p>
                    <p className="text-sm mt-2">
                      Si vous avez un export récent, vous pourrez le réimporter après la réinitialisation 
                      (à condition de connaître le mot de passe utilisé lors de l'export).
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium">Réinitialiser le stockage HDS</p>
                    <p className="text-sm text-muted-foreground">
                      Supprime toutes les données locales et la configuration
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleResetRequest}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rappel automatique d'export */}
      <ExportReminderDialog onExport={handleExportRequest} />

      {/* Dialogues de confirmation de sécurité */}
      <SecurityConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        onConfirm={confirmExport}
        title="Confirmer l'export des données HDS"
        description="Vous êtes sur le point d'exporter toutes vos données sensibles dans un fichier chiffré."
      />

      <SecurityConfirmationDialog
        open={showImportConfirm}
        onOpenChange={setShowImportConfirm}
        onConfirm={confirmImport}
        title="Confirmer l'import des données HDS"
        description="Cette opération va importer et fusionner des données depuis une sauvegarde. Les données existantes seront conservées."
      />

      {/* Dialogue de saisie du mot de passe */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe de déchiffrement</DialogTitle>
            <DialogDescription>
              Entrez le mot de passe utilisé lors de l'export pour déchiffrer le fichier de sauvegarde.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeImport()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setImportPassword('');
              setPendingImportFile(null);
            }}>
              Annuler
            </Button>
            <Button onClick={executeImport} disabled={!importPassword}>
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de reset */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Réinitialisation du stockage HDS
            </DialogTitle>
            <DialogDescription>
              Cette action est définitive et irréversible
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200 space-y-2">
              <p className="font-bold">⚠️ AVERTISSEMENT CRITIQUE</p>
              <p className="text-sm">Cette action va :</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Supprimer <strong>définitivement</strong> toutes vos données HDS locales</li>
                <li>Supprimer la configuration du stockage sécurisé</li>
                <li>Rendre impossible la récupération sans export préalable</li>
              </ul>
              <p className="text-sm font-medium mt-2">
                Les données cloud (cabinets, ostéopathes) ne seront PAS affectées.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetConfirm">
                Pour confirmer, tapez <code className="bg-muted px-2 py-1 rounded">SUPPRIMER</code>
              </Label>
              <Input
                id="resetConfirm"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Tapez SUPPRIMER"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowResetConfirm(false);
                setResetConfirmText('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReset}
              disabled={resetConfirmText !== 'SUPPRIMER'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Réinitialiser définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ConnectedStorageSettingsPage;