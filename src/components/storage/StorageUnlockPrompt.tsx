import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { hybridStorageManager } from '@/services/hybrid-storage-manager';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StorageUnlockPromptProps {
  securityMethod: 'pin' | 'password';
  onUnlock: () => void;
  onCancel?: () => void;
}

export const StorageUnlockPrompt: React.FC<StorageUnlockPromptProps> = ({
  securityMethod,
  onUnlock,
  onCancel
}) => {
  const [credential, setCredential] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const maxAttempts = 3;
  const isLocked = attempts >= maxAttempts;

  const handleUnlock = async () => {
    if (!credential.trim()) {
      setError('Veuillez saisir votre ' + (securityMethod === 'pin' ? 'code PIN' : 'mot de passe'));
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      const success = await hybridStorageManager.unlockStorage(credential);
      
      if (success) {
        toast.success('Stockage déverrouillé avec succès');
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          setError('Trop de tentatives incorrectes. Veuillez redémarrer l\'application.');
          toast.error('Accès bloqué après 3 tentatives');
        } else {
          setError(
            `${securityMethod === 'pin' ? 'Code PIN' : 'Mot de passe'} incorrect. ` +
            `${maxAttempts - newAttempts} tentative(s) restante(s).`
          );
          setCredential('');
        }
      }
    } catch (error) {
      console.error('Unlock error:', error);
      setError('Erreur lors du déverrouillage du stockage');
      toast.error('Erreur de déverrouillage');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLocked && !isUnlocking) {
      handleUnlock();
    }
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la configuration de stockage ? Toutes les données locales seront perdues.')) {
      localStorage.removeItem('hybrid-storage-config');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">
              Déverrouillage du stockage
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Saisissez votre {securityMethod === 'pin' ? 'code PIN' : 'mot de passe'} pour accéder aux données sensibles
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Indicateur de sécurité */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Stockage local sécurisé HDS</span>
            <Badge variant="secondary" className="text-xs">
              Obligatoire
            </Badge>
          </div>

          {/* Formulaire de déverrouillage */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="credential" className="text-sm font-medium">
                {securityMethod === 'pin' ? 'Code PIN' : 'Mot de passe'}
              </Label>
              <Input
                id="credential"
                type={securityMethod === 'pin' ? 'text' : 'password'}
                placeholder={securityMethod === 'pin' ? 'Entrez votre PIN' : 'Entrez votre mot de passe'}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLocked || isUnlocking}
                maxLength={securityMethod === 'pin' ? 8 : undefined}
                className="text-center"
                autoFocus
              />
            </div>

            {/* Compteur de tentatives */}
            {attempts > 0 && !isLocked && (
              <div className="text-center text-sm text-muted-foreground">
                Tentative {attempts} sur {maxAttempts}
              </div>
            )}
          </div>

          {/* Messages d'erreur */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleUnlock}
              disabled={isLocked || isUnlocking || !credential.trim()}
              className="w-full"
              size="lg"
            >
              {isUnlocking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Déverrouillage...
                </>
              ) : (
                'Déverrouiller'
              )}
            </Button>

            {isLocked && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                  size="sm"
                >
                  Réinitialiser la configuration
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  ⚠️ Cette action supprimera toutes les données locales
                </p>
              </div>
            )}

            {onCancel && !isLocked && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="w-full"
                size="sm"
              >
                Annuler
              </Button>
            )}

            {/* Lien de déblocage admin */}
            {!isLocked && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    if (!user?.id) {
                      toast.error('Utilisateur non connecté');
                      return;
                    }
                    const { data, error } = await supabase
                      .from('hybrid_storage_unlock_requests')
                      .select('id, new_credential, method')
                      .eq('user_id', user.id)
                      .eq('status', 'pending')
                      .maybeSingle();
                    if (error) throw error;
                    if (!data) {
                      toast.info('Aucune demande de déblocage trouvée');
                      return;
                    }
                    await hybridStorageManager.applyAdminReset(data.new_credential, data.method as 'pin' | 'password');
                    // Marquer comme appliquée
                    await supabase
                      .from('hybrid_storage_unlock_requests')
                      .update({ status: 'applied', applied_at: new Date().toISOString() })
                      .eq('id', data.id);
                    toast.success('Nouveau code appliqué');
                    onUnlock();
                  } catch (e: any) {
                    console.error(e);
                    toast.error(e.message || 'Erreur de déblocage');
                  }
                }}
                className="w-full"
                size="sm"
              >
                J'ai oublié mon code — appliquer le déblocage admin
              </Button>
            )}
          </div>

          {/* Information de sécurité */}
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>🔒 Vos données sont chiffrées localement avec AES-256</p>
            <p>📋 Conforme aux exigences HDS françaises</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};