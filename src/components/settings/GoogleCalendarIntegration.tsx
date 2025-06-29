
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Key, 
  Shield, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Trash2,
  AlertTriangle,
  Lock,
  Database,
  Eye,
  EyeOff
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function GoogleCalendarIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [existingClientId, setExistingClientId] = useState("");
  const [hasExistingSecret, setHasExistingSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    checkApiKeys();
  }, []);

  const checkApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer l'osteopath ID
      const { data: osteopath } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (!osteopath) return;

      // Utiliser une requête directe plutôt que RPC pour l'instant
      const { data, error } = await supabase
        .from('google_api_keys')
        .select('client_id, client_secret')
        .eq('osteopath_id', osteopath.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification des clés API:', error);
        return;
      }

      if (data) {
        setExistingClientId(data.client_id || "");
        setHasExistingSecret(!!data.client_secret);
        setIsConnected(!!(data.client_id && data.client_secret));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSaveKeys = async () => {
    if (!clientId.trim()) {
      toast.error("Veuillez saisir l'ID client");
      return;
    }

    if (!clientSecret.trim() && !hasExistingSecret) {
      toast.error("Veuillez saisir le secret client");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: osteopath } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (!osteopath) throw new Error("Profil ostéopathe non trouvé");

      // Insertion ou mise à jour directe
      const updateData: any = {
        osteopath_id: osteopath.id,
        client_id: clientId,
      };

      if (clientSecret) {
        updateData.client_secret = clientSecret;
      }

      const { error } = await supabase
        .from('google_api_keys')
        .upsert(updateData);

      if (error) throw error;

      toast.success("Clés API sauvegardées avec succès");
      await checkApiKeys();
      setClientId("");
      setClientSecret("");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde des clés API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKeys = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer la configuration Google Calendar ? Cela supprimera aussi vos tokens d'accès.")) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: osteopath } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (!osteopath) throw new Error("Profil ostéopathe non trouvé");

      const { error } = await supabase
        .from('google_api_keys')
        .delete()
        .eq('osteopath_id', osteopath.id);

      if (error) throw error;

      toast.success("Configuration Google Calendar supprimée");
      setIsConnected(false);
      setExistingClientId("");
      setHasExistingSecret(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isConnected) {
      toast.error("Veuillez d'abord configurer vos clés API Google");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const response = await supabase.functions.invoke('google-auth', {
        body: { userId: user.id }
      });

      if (response.error) throw response.error;

      if (response.data?.authUrl) {
        window.open(response.data.authUrl, '_blank', 'width=500,height=600');
        toast.success("Connexion Google Calendar initiée");
      }
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      toast.error("Erreur lors de la connexion à Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Intégration Google Calendar
          </CardTitle>
          <CardDescription>
            Synchronisez vos rendez-vous Doctolib via Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut de connexion */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">
                  {isConnected ? "Configuration active" : "Non configuré"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isConnected 
                    ? "Vos clés API sont configurées et sécurisées" 
                    : "Ajoutez vos clés API Google pour commencer"}
                </div>
              </div>
            </div>
            {isConnected && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Actif
              </Badge>
            )}
          </div>

          {/* Tutoriel clés API */}
          <Collapsible open={showTutorial} onOpenChange={setShowTutorial}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Comment obtenir mes clés API Google ?
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">Guide étape par étape :</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Rendez-vous sur <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></li>
                      <li>Créez un nouveau projet ou sélectionnez un projet existant</li>
                      <li>Activez l'API Google Calendar dans la bibliothèque d'APIs</li>
                      <li>Allez dans "Identifiants" puis "Créer des identifiants" → "ID client OAuth 2.0"</li>
                      <li>Configurez l'écran de consentement OAuth avec votre application</li>
                      <li>Ajoutez les URI de redirection autorisées (fournie par PatientHub)</li>
                      <li>Copiez l'ID client et le secret client générés</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Ces clés vous permettront d'importer automatiquement vos rendez-vous Doctolib synchronisés avec Google Calendar
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </Collapsible>

          {/* Informations de sécurité */}
          <Collapsible open={showSecurity} onOpenChange={setShowSecurity}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Sécurité et confidentialité des clés API
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">Garanties de sécurité :</p>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Chiffrement AES-256</div>
                          <div className="text-muted-foreground">Vos secrets client sont chiffrés avant stockage</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Isolation par ostéopathe</div>
                          <div className="text-muted-foreground">Chaque ostéopathe a ses propres clés, aucun partage</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Conformité RGPD</div>
                          <div className="text-muted-foreground">Respect des règlements européens sur la protection des données</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      🔒 Vos clés ne sont jamais transmises à d'autres utilisateurs et peuvent être supprimées à tout moment
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Configuration existante */}
          {isConnected && (
            <div className="space-y-4">
              <h4 className="font-medium">Configuration actuelle</h4>
              <div className="space-y-3">
                <div>
                  <Label>ID Client configuré</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={existingClientId} readOnly className="bg-muted" />
                    <Badge variant="secondary">Configuré</Badge>
                  </div>
                </div>
                <div>
                  <Label>Secret Client</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={hasExistingSecret ? "••••••••••••••••" : "Non configuré"} 
                      readOnly 
                      className="bg-muted" 
                    />
                    <Badge variant={hasExistingSecret ? "secondary" : "destructive"}>
                      {hasExistingSecret ? "Configuré" : "Manquant"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">
              {isConnected ? "Mettre à jour la configuration" : "Nouvelle configuration"}
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientId">ID Client Google *</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Votre ID client OAuth 2.0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="clientSecret">
                  Secret Client Google {hasExistingSecret ? "(laisser vide pour conserver)" : "*"}
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="clientSecret"
                    type={showSecret ? "text" : "password"}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder={hasExistingSecret ? "••••••••••••••••" : "Votre secret client OAuth 2.0"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {hasExistingSecret && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Un secret est déjà configuré. Laissez vide pour le conserver.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSaveKeys} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Sauvegarde..." : "Sauvegarder les clés"}
              </Button>
              
              {isConnected && (
                <>
                  <Button 
                    onClick={handleConnect} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Connexion..." : "Se connecter à Google"}
                  </Button>
                  
                  <Button 
                    onClick={handleDeleteKeys} 
                    disabled={isLoading}
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Supprimer la configuration</span>
                    <span className="sm:hidden">Supprimer</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Informations importantes */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important :</strong> Cette intégration permet uniquement d'importer vos rendez-vous 
              depuis Google Calendar (ex: ceux synchronisés avec Doctolib). La facturation reste manuelle 
              dans PatientHub, mais les événements importés seront associés automatiquement aux patients 
              correspondants pour faciliter la création de factures.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
