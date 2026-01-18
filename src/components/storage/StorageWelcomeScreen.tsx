/**
 * Écran de bienvenue pour la configuration du stockage sécurisé
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Bienvenue sur OstéoPraxis
            </CardTitle>
            <CardDescription className="text-lg">
              Configuration de votre <strong>stockage sécurisé</strong>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Message de bienvenue */}
          {isFirstConnection && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <p className="font-semibold mb-2">🎉 Première connexion</p>
                <p className="text-sm">
                  Pour garantir la <strong>confidentialité de vos données de santé</strong>, 
                  configurez maintenant un stockage local sécurisé. Configuration rapide : <strong>2 minutes</strong>.
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="border-primary/20 bg-primary/5">
            <Shield className="h-5 w-5 text-primary" />
            <AlertDescription>
              <p className="font-semibold mb-2">
                🔒 Protection maximale de vos données médicales
              </p>
              <p className="text-sm">
                OstéoPraxis respecte la réglementation <strong>HDS (Hébergeur de Données de Santé)</strong>. 
                Vos données sensibles sont stockées <strong>localement sur votre appareil</strong> avec un <strong>chiffrement AES-256-GCM</strong>, 
                garantissant qu'aucune information médicale n'est transmise vers le cloud.
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20 dark:to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Avec stockage sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>100% local</strong> - Aucune donnée dans le cloud</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Chiffrement <strong>AES-256-GCM</strong> militaire</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Conformité HDS</strong> complète</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Protection <strong>anti-falsification</strong> HMAC</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Toutes les <strong>fonctionnalités disponibles</strong></span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  Sans stockage local
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Fonctionnalités limitées</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Patients et rendez-vous</strong> non disponibles</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Non conforme HDS</strong> pour données médicales</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Configuration possible plus tard</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Points importants :
            </p>
            <ul className="text-sm space-y-1.5 ml-6">
              <li>• <strong>Configuration rapide</strong> : environ 2 minutes</li>
              <li>• Vous créerez un <strong>mot de passe unique</strong> pour chiffrer vos données</li>
              <li>• <strong className="text-destructive">Ce mot de passe est irremplaçable</strong> - conservez-le précieusement</li>
              <li>• <strong>Export/import</strong> de vos données pour changer d'appareil</li>
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
            💡 <strong>Fortement recommandé</strong> pour une utilisation professionnelle conforme HDS
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
