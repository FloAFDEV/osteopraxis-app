
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, RefreshCw, Unlink, ExternalLink, Settings, Save, HelpCircle, Shield, Trash2 } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpButton } from '@/components/ui/help-button';

export function GoogleCalendarIntegration() {
  const { user } = useAuth();
  const { isConnected, events, isLoading, connectGoogle, syncCalendar, disconnectGoogle } = useGoogleCalendar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showTutorialDialog, setShowTutorialDialog] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Check if API keys are configured using raw SQL
  useEffect(() => {
    const checkApiKeys = async () => {
      if (!user?.osteopathId) return;

      try {
        const { data, error } = await supabase.rpc('check_google_api_keys', {
          p_osteopath_id: user.osteopathId
        });

        if (error) {
          console.error('Error checking API keys:', error);
          return;
        }

        setHasApiKeys(!!data);
        if (data) {
          setGoogleClientId(data.client_id || '');
        }
      } catch (error) {
        console.error('Error checking API keys:', error);
      }
    };

    checkApiKeys();
  }, [user?.osteopathId]);

  // Handle OAuth callback
  useEffect(() => {
    const googleCode = searchParams.get('google_code');
    const state = searchParams.get('state');

    if (googleCode) {
      handleOAuthCallback(googleCode, state);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleOAuthCallback = async (code: string, state: string | null) => {
    try {
      const { error } = await supabase.functions.invoke('google-auth', {
        method: 'POST',
        body: { code, state },
      });

      if (error) {
        throw error;
      }

      toast.success('Google Calendar connecté avec succès !');
      window.location.reload();
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
    }
  };

  const handleSaveConfig = async () => {
    if (!googleClientId || !googleClientSecret) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!user?.osteopathId) {
      toast.error('Profil ostéopathe non trouvé');
      return;
    }

    setSavingConfig(true);
    try {
      const { error } = await supabase.rpc('save_google_api_keys', {
        p_osteopath_id: user.osteopathId,
        p_client_id: googleClientId,
        p_client_secret: googleClientSecret,
      });

      if (error) {
        throw error;
      }

      setHasApiKeys(true);
      setShowConfigDialog(false);
      toast.success('Configuration sauvegardée avec succès !');
      
      // Clear the secret from state for security
      setGoogleClientSecret('');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDeleteKeys = async () => {
    if (!user?.osteopathId) return;

    try {
      const { error } = await supabase.rpc('delete_google_api_keys', {
        p_osteopath_id: user.osteopathId
      });

      if (error) {
        throw error;
      }

      setHasApiKeys(false);
      setGoogleClientId('');
      setGoogleClientSecret('');
      toast.success('Clés API supprimées avec succès');
      
      // If connected, also disconnect
      if (isConnected) {
        await disconnectGoogle();
      }
    } catch (error) {
      console.error('Error deleting API keys:', error);
      toast.error('Erreur lors de la suppression des clés API');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>Synchronisation en cours...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar
          {isConnected && <Badge variant="secondary" className="bg-green-100 text-green-800">Connecté</Badge>}
          <HelpButton 
            content="Synchronisez votre Google Agenda pour afficher vos rendez-vous Doctolib dans le planning. Vos clés API sont stockées de manière sécurisée et chiffrées conformément au RGPD."
          />
        </CardTitle>
        <CardDescription>
          Synchronisez votre Google Agenda pour afficher vos rendez-vous Doctolib dans le planning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security and GDPR Information */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Sécurité & RGPD :</strong> Vos clés API Google sont chiffrées et stockées de manière sécurisée. 
            Elles ne sont jamais partagées et restent sous votre contrôle. Vous pouvez les supprimer à tout moment. 
            Conforme aux exigences RGPD pour la protection des données personnelles.
          </AlertDescription>
        </Alert>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900">
                  Comment connecter vos rendez-vous Doctolib ?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Connectez d'abord Doctolib à votre Google Agenda depuis votre compte Doctolib</li>
                  <li>Configurez vos clés Google API personnelles (obligatoire)</li>
                  <li>Cliquez sur "Connecter Google Calendar"</li>
                  <li>Autorisez l'accès en lecture à votre calendrier</li>
                  <li>Vos rendez-vous Doctolib apparaîtront dans le planning</li>
                </ol>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTutorialDialog(true)}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Guide détaillé
                  </Button>
                </div>
              </div>
            </div>

            {!hasApiKeys && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Settings className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-orange-900">
                    Configuration requise
                  </p>
                  <p className="text-orange-800">
                    Vous devez configurer vos propres clés API Google pour garantir la sécurité et le respect de votre quota d'utilisation.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    {hasApiKeys ? 'Modifier clés API' : 'Configurer API Google'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Configuration Google API</DialogTitle>
                    <DialogDescription>
                      Configurez vos clés API Google Cloud pour connecter votre calendrier
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client ID *</Label>
                      <Input
                        id="clientId"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="Votre Google Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">Client Secret *</Label>
                      <Input
                        id="clientSecret"
                        type="password"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                        placeholder="Votre Google Client Secret"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">📋 Guide de configuration :</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Rendez-vous sur <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                        <li>Créez un nouveau projet ou sélectionnez un existant</li>
                        <li>Activez l'API Google Calendar</li>
                        <li>Créez des identifiants OAuth 2.0</li>
                        <li>Ajoutez ces URLs autorisées :
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• <code className="bg-white px-1 rounded text-xs">https://jpjuvzpqfirymtjwnier.supabase.co</code></li>
                            <li>• <code className="bg-white px-1 rounded text-xs">https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/google-auth/callback</code></li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveConfig} 
                        className="flex-1"
                        disabled={savingConfig || !googleClientId || !googleClientSecret}
                      >
                        {savingConfig ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                      
                      {hasApiKeys && (
                        <Button 
                          variant="destructive"
                          onClick={handleDeleteKeys}
                          className="px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={connectGoogle} 
                className="w-full" 
                disabled={!hasApiKeys}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Connecter Google Calendar
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {hasApiKeys ? '✅' : '❌'} Clés API configurées</p>
              <p>• Vos clés restent privées et sécurisées</p>
              <p>• Chaque ostéopathe configure ses propres clés</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  Google Calendar connecté
                </span>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {events.length} événements synchronisés
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Button 
                onClick={syncCalendar} 
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Synchroniser</span>
                <span className="sm:hidden">Sync</span>
              </Button>
              
              <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Modifier clés</span>
                    <span className="sm:hidden">Clés</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Modifier la configuration Google API</DialogTitle>
                    <DialogDescription>
                      Mettez à jour vos clés API Google Cloud
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client ID *</Label>
                      <Input
                        id="clientId"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="Votre Google Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">Client Secret *</Label>
                      <Input
                        id="clientSecret"
                        type="password"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                        placeholder="Nouveau Client Secret (laisser vide pour ne pas changer)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveConfig} 
                        className="flex-1"
                        disabled={savingConfig || !googleClientId}
                      >
                        {savingConfig ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Mettre à jour
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteKeys}
                        className="px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                onClick={disconnectGoogle} 
                variant="outline" 
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Unlink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnecter</span>
                <span className="sm:hidden">Délier</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTutorialDialog(true)}
                className="w-full"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Aide</span>
                <span className="sm:hidden">?</span>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Les événements sont synchronisés automatiquement</p>
              <p>• Seuls les événements confirmés sont affichés</p>
              <p>• Les rendez-vous externes sont en lecture seule</p>
              <p>• 💡 <strong>Facturation :</strong> Créez manuellement une note d'honoraire depuis le planning</p>
            </div>
          </div>
        )}

        {/* Tutorial Dialog */}
        <Dialog open={showTutorialDialog} onOpenChange={setShowTutorialDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Guide complet - Intégration Google Calendar</DialogTitle>
              <DialogDescription>
                Tutoriel détaillé pour connecter vos rendez-vous Doctolib
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔐 Qu'est-ce qu'une clé API ?</h3>
                <p className="text-sm text-blue-800">
                  Une clé API est comme un "mot de passe" qui permet à PatientHub d'accéder à votre Google Calendar. 
                  C'est totalement sécurisé et vous gardez le contrôle total.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">📋 Étapes détaillées :</h3>
                
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">1. Connexion Doctolib ↔ Google</h4>
                    <p className="text-sm text-muted-foreground">
                      Dans votre compte Doctolib, allez dans "Paramètres" → "Calendrier" → "Synchronisation Google Calendar"
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">2. Création des clés API Google</h4>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                      <li>Allez sur <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                      <li>Créez un projet (ex: "MonCabinet-Calendar")</li>
                      <li>Activez l'API "Google Calendar"</li>
                      <li>Créez des "Identifiants" → "ID client OAuth 2.0"</li>
                      <li>Ajoutez les URLs autorisées (fournies ci-dessus)</li>
                    </ol>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium">3. Configuration dans PatientHub</h4>
                    <p className="text-sm text-muted-foreground">
                      Copiez votre Client ID et Client Secret dans le formulaire de configuration
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-medium">4. Connexion et synchronisation</h4>
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur "Connecter Google Calendar" et autorisez l'accès en lecture
                    </p>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sécurité garantie :</strong> Vos clés sont chiffrées et jamais partagées. 
                    PatientHub accède uniquement en lecture à vos événements Google Calendar.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="pt-2 border-t">
          <a 
            href="https://www.doctolib.fr/account/calendar-integration" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            Configurer Doctolib + Google Calendar
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
