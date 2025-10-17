/**
 * 🔓 Composant de récupération en cas de mot de passe oublié
 * Permet la récupération via backup .phds
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Upload, Shield, Key, RefreshCw, Trash2 } from 'lucide-react';
import { hdsSecureManager } from '@/services/hds-secure-storage/hds-secure-manager';
import { toast } from 'sonner';

interface StoragePasswordRecoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onRecoveryComplete: () => void;
}

type RecoveryStep = 'choose' | 'upload' | 'backup-password' | 'new-password' | 'confirm-password' | 'processing';

export const StoragePasswordRecovery: React.FC<StoragePasswordRecoveryProps> = ({
  isOpen,
  onClose,
  onRecoveryComplete
}) => {
  const [step, setStep] = useState<RecoveryStep>('choose');
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupPassword, setBackupPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setStep('choose');
    setBackupFile(null);
    setBackupPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.phds')) {
        setError('Veuillez sélectionner un fichier .phds valide');
        return;
      }
      setBackupFile(file);
      setError(null);
      setStep('backup-password');
    }
  };

  const handleVerifyBackupPassword = async () => {
    if (!backupFile || !backupPassword) {
      setError('Veuillez entrer le mot de passe du backup');
      return;
    }

    try {
      setError(null);
      const isValid = await hdsSecureManager.verifyBackupPassword(backupFile, backupPassword);
      
      if (isValid) {
        toast.success('Backup validé avec succès');
        setStep('new-password');
      } else {
        setError('Mot de passe du backup incorrect');
      }
    } catch (error) {
      console.error('Erreur validation backup:', error);
      setError('Impossible de valider le backup. Vérifiez le fichier et le mot de passe.');
    }
  };

  const handleNewPassword = () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setError(null);
    setStep('confirm-password');
  };

  const handleConfirmAndRecover = async () => {
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!backupFile || !backupPassword) {
      setError('Données manquantes');
      return;
    }

    setStep('processing');
    setError(null);

    try {
      // Étape 1 : Reset du stockage actuel
      toast.info('Réinitialisation du stockage...');
      await hdsSecureManager.reset();

      // Étape 2 : Reconfiguration avec nouveau mot de passe
      toast.info('Configuration avec le nouveau mot de passe...');
      const opfsHandle = await navigator.storage.getDirectory();
      await hdsSecureManager.configure({
        directoryHandle: opfsHandle,
        password: newPassword,
        entities: ['patients', 'appointments', 'invoices']
      });

      // Étape 3 : Import depuis le backup
      toast.info('Restauration des données...');
      const result = await hdsSecureManager.importAllSecure(backupFile, backupPassword, 'replace');

      const totalImported = Object.values(result.imported).reduce((sum, count) => sum + count, 0);

      if (result.errors.length > 0) {
        console.error('Erreurs lors de l\'import:', result.errors);
        toast.warning(`Récupération partielle : ${totalImported} éléments restaurés avec ${result.errors.length} erreur(s)`);
      } else {
        toast.success(`Récupération réussie ! ${totalImported} éléments restaurés`);
      }

      resetState();
      onRecoveryComplete();
    } catch (error) {
      console.error('Erreur récupération:', error);
      setError('Échec de la récupération. Veuillez réessayer.');
      setStep('choose');
      toast.error('Échec de la récupération');
    }
  };

  const handleDestructiveReset = async () => {
    const confirmed = window.confirm(
      '⚠️ ATTENTION : Cette action supprimera DÉFINITIVEMENT toutes vos données locales.\n\n' +
      'Aucune récupération ne sera possible.\n\n' +
      'Êtes-vous absolument certain de vouloir continuer ?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      '🚨 DERNIÈRE CONFIRMATION\n\n' +
      'Toutes vos données patients, rendez-vous et factures seront PERDUES.\n\n' +
      'Confirmer la suppression définitive ?'
    );

    if (!doubleConfirm) return;

    try {
      await hdsSecureManager.reset();
      toast.success('Stockage réinitialisé. Vous pouvez reconfigurer.');
      resetState();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Erreur reset:', error);
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && step !== 'processing') { resetState(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Récupération du mot de passe
          </DialogTitle>
          <DialogDescription>
            Récupérez l'accès à vos données via une sauvegarde .phds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Étape 1 : Choix de l'option */}
          {step === 'choose' && (
            <div className="space-y-4">
              <Card className="p-6 hover:border-primary cursor-pointer transition-colors" onClick={() => setStep('upload')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">J'ai une sauvegarde</h3>
                    <p className="text-muted-foreground text-sm">
                      Réinitialisez et restaurez vos données depuis un fichier .phds
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/50 hover:border-destructive cursor-pointer transition-colors" onClick={handleDestructiveReset}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-destructive">Je n'ai pas de sauvegarde</h3>
                    <p className="text-muted-foreground text-sm">
                      ⚠️ Supprimez toutes les données et recommencez (irréversible)
                    </p>
                  </div>
                </div>
              </Card>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  💡 Recommandation : Si vous avez une sauvegarde .phds récente, utilisez la première option pour récupérer vos données.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Étape 2 : Upload du fichier */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-file">Sélectionnez votre fichier de sauvegarde</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".phds"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
                {backupFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ✅ Fichier sélectionné : {backupFile.name}
                  </p>
                )}
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Étape 3 : Mot de passe du backup */}
          {step === 'backup-password' && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Entrez le mot de passe qui a été utilisé lors de la création de cette sauvegarde.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="backup-password">Mot de passe du backup</Label>
                <Input
                  id="backup-password"
                  type="password"
                  placeholder="Mot de passe de la sauvegarde"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyBackupPassword()}
                  autoFocus
                />
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('upload')}>Retour</Button>
                <Button onClick={handleVerifyBackupPassword} className="flex-1">
                  Valider le backup
                </Button>
              </div>
            </div>
          )}

          {/* Étape 4 : Nouveau mot de passe */}
          {step === 'new-password' && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Définissez un nouveau mot de passe pour sécuriser votre stockage local.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="new-password">Nouveau mot de passe (min. 8 caractères)</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewPassword()}
                  autoFocus
                />
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleNewPassword} className="w-full">
                Continuer
              </Button>
            </div>
          )}

          {/* Étape 5 : Confirmation du mot de passe */}
          {step === 'confirm-password' && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Confirmez votre nouveau mot de passe pour finaliser la récupération.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="confirm-password">Confirmez le nouveau mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirmez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConfirmAndRecover()}
                  autoFocus
                />
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('new-password')}>Retour</Button>
                <Button onClick={handleConfirmAndRecover} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Récupérer mes données
                </Button>
              </div>
            </div>
          )}

          {/* Étape 6 : Traitement en cours */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-lg font-semibold">Récupération en cours...</p>
              <p className="text-muted-foreground text-sm mt-2">
                Ne fermez pas cette fenêtre
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
