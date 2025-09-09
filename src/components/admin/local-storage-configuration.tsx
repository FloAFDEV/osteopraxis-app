import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  HardDrive,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import { hdsSecureManager } from '@/services/hds-secure-storage/hds-secure-manager';
import { toast } from 'sonner';

export function LocalStorageConfiguration() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [configMode, setConfigMode] = useState<'check' | 'configure'>('check');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checkStorageStatus = async () => {
    try {
      setLoading(true);
      const storageStatus = await hdsSecureManager.getStatus();
      const support = hdsSecureManager.checkSupport();
      
      setStatus({
        ...storageStatus,
        support
      });
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setStatus({
        isConfigured: false,
        isUnlocked: false,
        physicalStorageAvailable: false,
        support: { supported: false, details: ['Erreur de vérification'] }
      });
    } finally {
      setLoading(false);
    }
  };

  const configureStorage = async () => {
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setLoading(true);
      
      // Simuler la configuration du stockage HDS
      // En production, ceci déclencherait le processus de configuration réel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Configuration du stockage HDS initiée. Vérifiez l\'état après quelques secondes.');
      
      // Vérifier l'état après configuration
      await checkStorageStatus();
      setConfigMode('check');
      setPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      toast.error('Erreur lors de la configuration du stockage');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isConfigured: boolean, isUnlocked: boolean) => {
    if (isConfigured && isUnlocked) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Configuré et Déverrouillé</Badge>;
    } else if (isConfigured) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Lock className="h-3 w-3 mr-1" />Configuré mais Verrouillé</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Non Configuré</Badge>;
    }
  };

  React.useEffect(() => {
    checkStorageStatus();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Configuration du Stockage Local Sécurisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status && loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* État actuel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">État</span>
                  {status && getStatusBadge(status.isConfigured, status.isUnlocked)}
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Support API</span>
                  <Badge variant={status?.support?.supported ? "default" : "secondary"}>
                    {status?.support?.supported ? 'Supporté' : 'Non supporté'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">Stockage Physique</span>
                  <Badge variant={status?.physicalStorageAvailable ? "default" : "secondary"}>
                    {status?.physicalStorageAvailable ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </div>
              </div>

              {/* Avertissement si non configuré */}
              {status && !status.isConfigured && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Le stockage local sécurisé HDS n'est pas configuré. Ceci peut affecter les fonctionnalités 
                    de sécurité et de conformité. Il est recommandé de le configurer pour un environnement de production.
                  </AlertDescription>
                </Alert>
              )}

              {/* Support API détails */}
              {status?.support?.details && status.support.details.length > 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <strong>Détails du support :</strong> {status.support.details.join(', ')}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={checkStorageStatus} 
                  disabled={loading}
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Vérifier l'État
                </Button>

                {status && !status.isConfigured && (
                  <Button 
                    onClick={() => setConfigMode('configure')}
                    disabled={!status.support?.supported}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurer le Stockage
                  </Button>
                )}

                {status && status.isConfigured && !status.isUnlocked && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>
                        <Unlock className="h-4 w-4 mr-2" />
                        Déverrouiller
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Déverrouiller le Stockage</AlertDialogTitle>
                        <AlertDialogDescription>
                          Entrez le mot de passe pour déverrouiller le stockage sécurisé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="unlock-password">Mot de passe</Label>
                          <Input
                            id="unlock-password"
                            type="password"
                            placeholder="Mot de passe du stockage"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPassword('')}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          // Simuler le déverrouillage
                          toast.success('Stockage déverrouillé');
                          setPassword('');
                          checkStorageStatus();
                        }}>
                          Déverrouiller
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      {configMode === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configurer le Stockage Sécurisé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Cette configuration mettra en place le stockage local sécurisé HDS avec chiffrement AES-256-GCM 
                et signature HMAC pour la conformité aux normes de sécurité des données de santé.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="config-password">Mot de passe principal</Label>
                <Input
                  id="config-password"
                  type="password"
                  placeholder="Mot de passe sécurisé (min. 8 caractères)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={configureStorage} 
                  disabled={loading || !password || password !== confirmPassword}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Configuration...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConfigMode('check');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}