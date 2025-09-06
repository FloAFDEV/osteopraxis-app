import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Database } from 'lucide-react';
import { hybridStorageManager } from '@/services/hybrid-storage-manager';
import { toast } from 'sonner';

export function HybridStorageSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [securityMethod, setSecurityMethod] = useState<'pin' | 'password'>('pin');
  const [credential, setCredential] = useState('');

  const handleSetup = async () => {
    if (!credential) {
      toast.error('Veuillez saisir un code PIN ou mot de passe');
      return;
    }

    if (securityMethod === 'pin' && credential.length < 4) {
      toast.error('Le code PIN doit contenir au moins 4 chiffres');
      return;
    }

    if (securityMethod === 'password' && credential.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      await hybridStorageManager.configureStorage({
        storageLocation: 'OPFS',
        securityMethod,
        credential,
        encryptionEnabled: true,
      });

      toast.success('Configuration terminée avec succès');
      window.location.reload(); // Rafraîchir pour recharger l'état
      
    } catch (error) {
      console.error('Configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Configuration du Stockage Local</CardTitle>
          <CardDescription>
            Pour respecter la conformité HDS, vos données sensibles doivent être stockées localement de manière sécurisée.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Stockage local OPFS avec chiffrement</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Conformité RGPD et HDS garantie</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-method">Méthode de sécurité</Label>
            <select
              id="security-method"
              value={securityMethod}
              onChange={(e) => setSecurityMethod(e.target.value as 'pin' | 'password')}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="pin">Code PIN (4 chiffres minimum)</option>
              <option value="password">Mot de passe (6 caractères minimum)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credential">
              {securityMethod === 'pin' ? 'Code PIN' : 'Mot de passe'}
            </Label>
            <Input
              id="credential"
              type={securityMethod === 'pin' ? 'number' : 'password'}
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder={securityMethod === 'pin' ? 'Entrez votre code PIN' : 'Entrez votre mot de passe'}
              maxLength={securityMethod === 'pin' ? 6 : undefined}
            />
          </div>

          <Button 
            onClick={handleSetup} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? 'Configuration en cours...' : 'Configurer le stockage'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ce code sera requis à chaque connexion pour déverrouiller vos données sensibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}