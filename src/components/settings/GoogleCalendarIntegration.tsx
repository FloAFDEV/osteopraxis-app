
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, RefreshCw, Unlink, ExternalLink } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function GoogleCalendarIntegration() {
  const { isConnected, events, isLoading, connectGoogle, syncCalendar, disconnectGoogle } = useGoogleCalendar();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
    const googleCode = searchParams.get('google_code');
    const state = searchParams.get('state');

    if (googleCode) {
      handleOAuthCallback(googleCode, state);
      // Clear URL parameters
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
      window.location.reload(); // Refresh to update connection status
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
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
        </CardTitle>
        <CardDescription>
          Synchronisez votre Google Agenda pour afficher vos rendez-vous Doctolib dans le planning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  <li>Cliquez sur "Connecter Google Calendar" ci-dessous</li>
                  <li>Autorisez l'accès en lecture à votre calendrier</li>
                  <li>Vos rendez-vous Doctolib apparaîtront automatiquement dans le planning</li>
                </ol>
              </div>
            </div>

            <Button onClick={connectGoogle} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Connecter Google Calendar
            </Button>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={syncCalendar} 
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser
              </Button>
              
              <Button 
                onClick={disconnectGoogle} 
                variant="outline" 
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Déconnecter
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Les événements sont synchronisés automatiquement</p>
              <p>• Seuls les événements confirmés sont affichés</p>
              <p>• Les rendez-vous externes sont en lecture seule</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <a 
            href="https://www.doctolib.fr" 
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
