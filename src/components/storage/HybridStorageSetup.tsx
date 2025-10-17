import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Database } from 'lucide-react';
import { hdsSecureManager, type HDSSecureConfig } from '@/services/hds-secure-storage/hds-secure-manager';
import { requestStorageDirectory } from '@/services/native-file-storage/native-file-adapter';
import { toast } from 'sonner';

export function HybridStorageSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetup = async () => {
    if (!password || !confirmPassword) {
      toast.error('Veuillez saisir et confirmer le mot de passe');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Validation de complexité
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || 
        !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Le mot de passe doit contenir : majuscules, minuscules, chiffres et symboles');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      // Demander accès au répertoire de stockage
      const directoryHandle = await requestStorageDirectory();
      
      const config: HDSSecureConfig = {
        directoryHandle,
        password,
        entities: ['patients', 'appointments', 'invoices']
      };
      
      await hdsSecureManager.configure(config);

      toast.success('Configuration terminée avec succès');
      window.location.reload(); // Rafraîchir pour recharger l'état
      
    } catch (error) {
      console.error('Configuration failed:', error);
      toast.error('Erreur lors de la configuration du stockage: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
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
            <Label htmlFor="password">
              Mot de passe de chiffrement
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmer le mot de passe
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
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