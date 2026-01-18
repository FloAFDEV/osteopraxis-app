/**
 * 🎯 Assistant de première connexion
 * 
 * Guide l'utilisateur lors de sa première connexion en mode connecté
 * Propose la configuration du stockage HDS sécurisé
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Shield, Stethoscope, Info, ArrowRight } from 'lucide-react';

interface FirstLoginWizardProps {
  userName: string;
  onComplete: () => void;
  onConfigureStorage: () => void;
  onSkip: () => void;
}

export const FirstLoginWizard: React.FC<FirstLoginWizardProps> = ({
  userName,
  onComplete,
  onConfigureStorage,
  onSkip
}) => {
  const [step, setStep] = useState<'welcome' | 'storage' | 'profile'>('welcome');
  const navigate = useNavigate();

  const getStepProgress = () => {
    switch (step) {
      case 'welcome': return 33;
      case 'storage': return 66;
      case 'profile': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bienvenue dans OstéoPraxis !</CardTitle>
          <CardDescription className="text-base">
            Votre cabinet numérique sécurisé et conforme HDS
          </CardDescription>
          <Progress value={getStepProgress()} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'welcome' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">
                  Bonjour {userName} 👋
                </h3>
                <p className="text-muted-foreground">
                  Nous sommes ravis de vous accueillir ! Configurons ensemble votre espace de travail sécurisé.
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuration en 2 étapes simples :</strong>
                  <br />1. Configuration du stockage sécurisé (recommandé)
                  <br />2. Compléter votre profil professionnel
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="pt-6 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Sécurité HDS</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Données médicales 100% locales
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Simple</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configuration en quelques clics
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                  <CardContent className="pt-6 text-center">
                    <Stethoscope className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Professionnel</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Outils adaptés aux ostéopathes
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onSkip}>
                  Ignorer pour l'instant
                </Button>
                <Button onClick={() => setStep('storage')}>
                  Commencer la configuration
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'storage' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">Stockage HDS Sécurisé</h3>
                <p className="text-muted-foreground">
                  Pour une conformité HDS totale, nous recommandons fortement de configurer le stockage local sécurisé.
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pourquoi configurer le stockage sécurisé ?</strong>
                  <br />• Vos données médicales restent 100% sur votre ordinateur
                  <br />• Chiffrement AES-256-GCM de niveau militaire
                  <br />• Conformité HDS garantie
                  <br />• Aucune dépendance au cloud pour les données sensibles
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setStep('profile')}>
                  Configurer plus tard
                </Button>
                <Button onClick={onConfigureStorage} className="bg-green-600 hover:bg-green-700">
                  Configurer le stockage sécurisé
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Profil professionnel</h3>
                <p className="text-muted-foreground">
                  Complétez votre profil pour commencer à utiliser OstéoPraxis
                </p>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre profil professionnel vous permet de :
                  <br />• Créer et gérer vos cabinets
                  <br />• Générer des factures personnalisées
                  <br />• Partager vos informations avec vos patients
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onComplete}>
                  Compléter plus tard
                </Button>
                <Button onClick={() => {
                  navigate('/settings/profile');
                  onComplete();
                }}>
                  Compléter mon profil
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
