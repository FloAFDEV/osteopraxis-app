/**
 * 🔐 Configuration du Stockage HDS Sécurisé
 * 
 * Interface pour configurer le stockage local avec chiffrement AES-256-GCM
 * Remplace l'ancienne configuration hybride par une approche 100% sécurisée
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Shield, FolderOpen, Key, AlertTriangle, CheckCircle, Info, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getExecutionContext } from '@/utils/iframe-detection';

interface SecureStorageSetupProps {
  onComplete: (config: SecureStorageConfig) => Promise<void>;
  onCancel: () => void;
}

interface SecureStorageConfig {
  password: string;
  confirmPassword: string;
}

export const SecureStorageSetup: React.FC<SecureStorageSetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'info' | 'password' | 'confirm'>('info');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(() => getExecutionContext());
  
  useEffect(() => {
    setContext(getExecutionContext());
  }, []);
  
  const isPreviewMode = context.isIframe || context.isLovablePreview;


  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Au moins une lettre majuscule requise');
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push('Au moins une lettre minuscule requise');
    }
    
    if (!/[0-9]/.test(pwd)) {
      errors.push('Au moins un chiffre requis');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('Au moins un caractère spécial requis');
    }

    return { valid: errors.length === 0, errors };
  };

  const handlePasswordSubmit = () => {
    const validation = validatePassword(password);
    
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setStep('confirm');
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    
    try {
      // OPFS sera utilisé automatiquement - pas besoin de directoryHandle
      await onComplete({
        password,
        confirmPassword
      });
      
      toast.success('Stockage HDS sécurisé configuré avec succès');
    } catch (error) {
      console.error('Erreur configuration:', error);
      toast.error('Erreur lors de la configuration du stockage sécurisé');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    switch (step) {
      case 'info': return 33;
      case 'password': return 66;
      case 'confirm': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-2xl">Configuration du Stockage Sécurisé</CardTitle>
            </div>
            <CardDescription className="text-base">
              Protégez vos données médicales avec un <strong>chiffrement AES-256-GCM</strong>
            </CardDescription>
          </div>
          <Progress value={getStepProgress()} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'info' && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sécurité maximale :</strong> Vos données médicales seront stockées localement sur votre appareil 
                  avec un <strong>chiffrement AES-256-GCM</strong> et une <strong>signature anti-falsification</strong>.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Avantages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                      <li>• <strong>100% local</strong> - Aucune donnée dans le cloud</li>
                      <li>• Chiffrement <strong>AES-256-GCM</strong> militaire</li>
                      <li>• Protection <strong>anti-falsification</strong> HMAC</li>
                      <li>• <strong>Conformité HDS</strong> garantie</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      Important
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="text-sm space-y-1 text-orange-700 dark:text-orange-300">
                      <li>• <strong>Mot de passe requis</strong> à chaque utilisation</li>
                      <li>• Stockage automatique dans le navigateur</li>
                      <li>• <strong>Sauvegarde régulière</strong> recommandée</li>
                      <li>• <strong className="text-destructive">Perte mot de passe = perte données</strong></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onCancel}>
                  Ignorer pour l'instant
                </Button>
                <Button onClick={() => setStep('password')}>
                  Configurer le stockage sécurisé
                </Button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Key className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg">Mot de passe de chiffrement</h3>
                  <p className="text-muted-foreground">
                    Créez un mot de passe fort pour chiffrer vos données médicales
                  </p>
                </div>
              </div>

              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <p className="font-bold mb-2">⚠️ AVERTISSEMENT CRITIQUE</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Ce mot de passe est <strong>irremplaçable et irrécupérable</strong></li>
                    <li>• En cas d'oubli : <strong>perte définitive de TOUTES vos données</strong></li>
                    <li>• <strong>Aucune assistance technique ne pourra les récupérer</strong></li>
                    <li>• <strong>Notez-le dans un gestionnaire de mots de passe sécurisé</strong></li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">💡 Bonnes pratiques :</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Utilisez un <strong>gestionnaire de mots de passe</strong> (Bitwarden, 1Password, etc.)</li>
                    <li>• <strong>Exportez régulièrement</strong> vos données (recommandé : 1x/mois)</li>
                    <li>• Le fichier d'export est <strong>également chiffré</strong> avec ce mot de passe</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères avec majuscules, chiffres et symboles"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Saisissez à nouveau votre mot de passe"
                  />
                </div>

                {password && (
                  <div className="text-sm">
                    <p className="font-medium">Exigences du mot de passe :</p>
                    <ul className="space-y-1 mt-2">
                      <li className={password.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                        {password.length >= 8 ? '✓' : '✗'} Au moins 8 caractères
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/[A-Z]/.test(password) ? '✓' : '✗'} Au moins une majuscule
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/[a-z]/.test(password) ? '✓' : '✗'} Au moins une minuscule
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/[0-9]/.test(password) ? '✓' : '✗'} Au moins un chiffre
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '✗'} Au moins un caractère spécial
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setStep('info')}>
                  Retour
                </Button>
                <Button 
                  onClick={handlePasswordSubmit}
                  disabled={!password || !confirmPassword}
                >
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Shield className="w-16 h-16 mx-auto text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg text-green-600">Configuration terminée</h3>
                  <p className="text-muted-foreground">
                    Votre stockage HDS sécurisé est prêt à être activé
                  </p>
                </div>
              </div>

              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Stockage :</span>
                      <span className="text-sm">Espace privé local du navigateur</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Chiffrement :</span>
                      <span className="text-sm text-green-600"><strong>AES-256-GCM + HMAC</strong></span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Statut :</span>
                      <span className="text-sm text-green-600"><strong>Prêt à activer</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Une fois activé, toutes vos données médicales seront automatiquement chiffrées 
                  et stockées localement de manière sécurisée.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setStep('password')}>
                  Modifier
                </Button>
                <Button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Activation...' : 'Activer le stockage sécurisé'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};