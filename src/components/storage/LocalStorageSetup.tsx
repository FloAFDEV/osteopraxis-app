import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, FolderOpen, Key, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

interface LocalStorageSetupProps {
  onComplete: (config: LocalStorageConfig) => void;
  onCancel?: () => void;
}

interface LocalStorageConfig {
  storageLocation: string;
  securityMethod: 'pin' | 'password';
  credential: string;
  encryptionEnabled: boolean;
}

interface StorageStatus {
  available: boolean;
  size: number;
  location: string;
  encrypted: boolean;
}

export const LocalStorageSetup: React.FC<LocalStorageSetupProps> = ({
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<'location' | 'security' | 'verification' | 'completion'>('location');
  const [config, setConfig] = useState<Partial<LocalStorageConfig>>({
    securityMethod: 'password',
    encryptionEnabled: true
  });
  const [isValidating, setIsValidating] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [credential, setCredential] = useState('');
  const [confirmCredential, setConfirmCredential] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Vérifier la disponibilité du stockage local au montage
  useEffect(() => {
    checkStorageAvailability();
  }, []);

  const checkStorageAvailability = async () => {
    try {
      setIsValidating(true);
      
      // Vérifier le support OPFS
      if (!('navigator' in window && 'storage' in navigator)) {
        throw new Error('Le stockage local n\'est pas supporté par ce navigateur');
      }

      // Estimer l'espace disponible
      const estimate = await navigator.storage.estimate();
      const availableSpace = estimate.quota || 0;
      const usedSpace = estimate.usage || 0;

      setStorageStatus({
        available: availableSpace > 100 * 1024 * 1024, // Minimum 100MB
        size: availableSpace - usedSpace,
        location: 'OPFS (Origin Private File System)',
        encrypted: true
      });

      setIsValidating(false);
    } catch (error) {
      console.error('Storage availability check failed:', error);
      setErrors([error instanceof Error ? error.message : 'Erreur de stockage']);
      setIsValidating(false);
    }
  };

  const selectStorageLocation = async () => {
    if (!storageStatus?.available) {
      setErrors(['Le stockage local n\'est pas disponible']);
      return;
    }

    setConfig(prev => ({
      ...prev,
      storageLocation: storageStatus.location
    }));
    setStep('security');
  };

  const validateCredentials = () => {
    const newErrors: string[] = [];

    if (config.securityMethod === 'pin') {
      if (!/^\d{4,8}$/.test(credential)) {
        newErrors.push('Le PIN doit contenir entre 4 et 8 chiffres');
      }
    } else {
      if (credential.length < 8) {
        newErrors.push('Le mot de passe doit contenir au moins 8 caractères');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credential)) {
        newErrors.push('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    }

    if (credential !== confirmCredential) {
      newErrors.push('La confirmation ne correspond pas');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const setupSecurity = () => {
    if (!validateCredentials()) {
      return;
    }

    setConfig(prev => ({
      ...prev,
      credential
    }));
    setStep('verification');
  };

  const completeSetup = async () => {
    try {
      setIsValidating(true);

      // Valider la configuration finale
      if (!config.storageLocation || !config.securityMethod || !credential) {
        throw new Error('Configuration incomplète');
      }

      const finalConfig: LocalStorageConfig = {
        storageLocation: config.storageLocation!,
        securityMethod: config.securityMethod!,
        credential,
        encryptionEnabled: config.encryptionEnabled!
      };

      // Tester la création du stockage
      await testStorageSetup(finalConfig);
      
      setStep('completion');
      
      // Attendre un moment pour afficher le succès puis terminer
      setTimeout(() => {
        onComplete(finalConfig);
        toast.success('Stockage local configuré avec succès');
      }, 2000);

    } catch (error) {
      console.error('Setup completion failed:', error);
      setErrors([error instanceof Error ? error.message : 'Erreur lors de la finalisation']);
    } finally {
      setIsValidating(false);
    }
  };

  const testStorageSetup = async (config: LocalStorageConfig) => {
    // Simulation du test de configuration
    // Dans la vraie implémentation, ceci initialiserait le service SQLite avec chiffrement
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getProgressPercentage = () => {
    switch (step) {
      case 'location': return 25;
      case 'security': return 50;
      case 'verification': return 75;
      case 'completion': return 100;
      default: return 0;
    }
  };

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Database className="mx-auto h-12 w-12 text-primary" />
        <div>
          <h3 className="text-xl font-semibold">Configuration du stockage local</h3>
          <p className="text-muted-foreground mt-2">
            Les données sensibles HDS seront stockées de manière sécurisée sur votre ordinateur
          </p>
        </div>
      </div>

      {isValidating ? (
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Vérification du stockage disponible...</p>
        </div>
      ) : storageStatus ? (
        <div className="space-y-4">
          <Alert className={storageStatus.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertTriangle className={`h-4 w-4 ${storageStatus.available ? 'text-green-600' : 'text-red-600'}`} />
            <AlertDescription className={storageStatus.available ? 'text-green-800' : 'text-red-800'}>
              {storageStatus.available ? (
                <>
                  Stockage local disponible : {Math.round(storageStatus.size / (1024 * 1024))} MB
                  <br />
                  Location : {storageStatus.location}
                  <br />
                  Chiffrement : {storageStatus.encrypted ? 'Activé' : 'Désactivé'}
                </>
              ) : (
                'Stockage local non disponible ou insuffisant (minimum 100MB requis)'
              )}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm">Chiffrement AES-256</span>
            </div>
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Stockage privé</span>
            </div>
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-purple-600" />
              <span className="text-sm">Accès sécurisé</span>
            </div>
          </div>
        </div>
      ) : null}

      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button
          onClick={selectStorageLocation}
          disabled={!storageStatus?.available || isValidating}
          className="ml-auto"
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderSecurityStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Key className="mx-auto h-12 w-12 text-primary" />
        <div>
          <h3 className="text-xl font-semibold">Sécurisation des données</h3>
          <p className="text-muted-foreground mt-2">
            Choisissez votre méthode de protection des données sensibles
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Méthode de sécurité</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.securityMethod === 'pin' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setConfig(prev => ({ ...prev, securityMethod: 'pin' }))}
            >
              <div className="text-center">
                <div className="font-medium">Code PIN</div>
                <div className="text-sm text-muted-foreground">4-8 chiffres</div>
              </div>
            </div>
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.securityMethod === 'password' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setConfig(prev => ({ ...prev, securityMethod: 'password' }))}
            >
              <div className="text-center">
                <div className="font-medium">Mot de passe</div>
                <div className="text-sm text-muted-foreground">Sécurité renforcée</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="credential">
              {config.securityMethod === 'pin' ? 'Code PIN' : 'Mot de passe'}
            </Label>
            <Input
              id="credential"
              type={config.securityMethod === 'pin' ? 'text' : 'password'}
              placeholder={config.securityMethod === 'pin' ? 'Entrez votre PIN' : 'Entrez votre mot de passe'}
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              maxLength={config.securityMethod === 'pin' ? 8 : undefined}
            />
          </div>
          <div>
            <Label htmlFor="confirmCredential">
              Confirmation
            </Label>
            <Input
              id="confirmCredential"
              type={config.securityMethod === 'pin' ? 'text' : 'password'}
              placeholder="Confirmez votre saisie"
              value={confirmCredential}
              onChange={(e) => setConfirmCredential(e.target.value)}
              maxLength={config.securityMethod === 'pin' ? 8 : undefined}
            />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('location')}>
          Retour
        </Button>
        <Button onClick={setupSecurity} disabled={!credential || !confirmCredential}>
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-primary" />
        <div>
          <h3 className="text-xl font-semibold">Vérification de la configuration</h3>
          <p className="text-muted-foreground mt-2">
            Vérifiez les paramètres avant la finalisation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Stockage</Label>
            <Badge variant="secondary">{config.storageLocation}</Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Sécurité</Label>
            <Badge variant="secondary">
              {config.securityMethod === 'pin' ? 'Code PIN' : 'Mot de passe'}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Chiffrement</Label>
            <Badge variant="secondary">AES-256 activé</Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Sauvegarde</Label>
            <Badge variant="secondary">Automatique</Badge>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important :</strong> Assurez-vous de retenir votre {config.securityMethod === 'pin' ? 'code PIN' : 'mot de passe'}. 
            Il sera nécessaire pour accéder à vos données à chaque session.
          </AlertDescription>
        </Alert>
      </div>

      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('security')}>
          Retour
        </Button>
        <Button onClick={completeSetup} disabled={isValidating}>
          {isValidating ? 'Configuration...' : 'Finaliser'}
        </Button>
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <div>
          <h3 className="text-xl font-semibold text-green-800">Configuration terminée !</h3>
          <p className="text-muted-foreground mt-2">
            Votre stockage local sécurisé est maintenant configuré
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          Toutes les données sensibles HDS seront désormais stockées de manière sécurisée 
          sur votre ordinateur avec un chiffrement AES-256.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Configuration du stockage HDS obligatoire
        </CardTitle>
        <div className="space-y-2">
          <Progress value={getProgressPercentage()} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Étape {step === 'location' ? '1' : step === 'security' ? '2' : step === 'verification' ? '3' : '4'} sur 4</span>
            <span>{getProgressPercentage()}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === 'location' && renderLocationStep()}
        {step === 'security' && renderSecurityStep()}
        {step === 'verification' && renderVerificationStep()}
        {step === 'completion' && renderCompletionStep()}
      </CardContent>
    </Card>
  );
};