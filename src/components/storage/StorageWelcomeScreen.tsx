/**
 * Écran de bienvenue pour la première connexion
 * Remplace le loader pour une meilleure UX
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, ArrowRight, X, Monitor } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getExecutionContext } from '@/utils/iframe-detection';

interface StorageWelcomeScreenProps {
  onConfigure: () => void;
  onSkip: () => void;
  isFirstConnection?: boolean;
}

export const StorageWelcomeScreen: React.FC<StorageWelcomeScreenProps> = ({ 
  onConfigure, 
  onSkip,
  isFirstConnection = false
}) => {
  const [context, setContext] = useState(() => getExecutionContext());
  
  useEffect(() => {
    setContext(getExecutionContext());
  }, []);
  
  const isPreviewMode = context.isIframe || context.isLovablePreview;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Bienvenue sur PatientHub
              </CardTitle>
              {isPreviewMode && (
                <Badge variant="secondary" className="gap-1">
                  <Monitor className="w-3 h-3" />
                  Preview
                </Badge>
              )}
            </div>
            <CardDescription className="text-lg">
              {isPreviewMode 
                ? 'Configuration du stockage temporaire chiffré (Mode Prévisualisation)'
                : 'Configuration du stockage sécurisé de vos données médicales'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ÉTAPE 4 : Message spécial pour première connexion */}
          {isFirstConnection && !isPreviewMode && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <p className="font-semibold mb-2">🎉 Première connexion détectée !</p>
                <p className="text-sm">
                  Pour garantir la confidentialité de vos données de santé (HDS), 
                  nous vous recommandons fortement de configurer un stockage local sécurisé.
                  Cette configuration ne prend que 2 minutes et protégera vos données avec un chiffrement militaire.
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-2">
                {isPreviewMode ? '🖼️ Mode Prévisualisation - Stockage Temporaire' : '🔒 Protection maximale de vos données HDS'}
              </p>
              <p className="text-sm">
                {isPreviewMode 
                  ? 'Votre environnement de prévisualisation utilisera IndexedDB chiffré avec AES-256-GCM. Vos données seront protégées localement. Une fois l\'application déployée, vous bénéficierez du stockage permanent dans un dossier local.'
                  : 'Pour respecter la réglementation HDS (Hébergeur de Données de Santé), nous vous proposons de configurer un stockage local chiffré pour vos données sensibles.'
                }
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20 dark:to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  {isPreviewMode ? 'Stockage temporaire chiffré' : 'Stockage local sécurisé'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{isPreviewMode ? 'Stockage local dans le navigateur' : '100% local - Aucune donnée sensible dans le cloud'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Chiffrement AES-256-GCM militaire</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{isPreviewMode ? 'Protection temporaire des données' : 'Conformité HDS complète'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Protection anti-falsification</span>
                </div>
                {isPreviewMode && (
                  <div className="flex items-start gap-2 text-blue-600 dark:text-blue-400">
                    <Monitor className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Passage automatique au stockage permanent après déploiement</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  Sans stockage local
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span>Fonctionnalités limitées</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span>Patients et RDV non disponibles</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span>Non conforme HDS pour données médicales</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Configuration possible plus tard</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Ce que vous devez savoir :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Configuration rapide : environ 2 minutes</li>
              <li>• Vous créerez un mot de passe unique pour chiffrer vos données</li>
              <li>• Ce mot de passe est irremplaçable - notez-le bien !</li>
              <li>• Vous pourrez exporter/importer vos données pour changer d'appareil</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onSkip}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Ignorer pour l'instant
            </Button>
            <Button
              size="lg"
              onClick={onConfigure}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Configurer maintenant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            💡 Recommandé pour une utilisation professionnelle complète et conforme HDS
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
