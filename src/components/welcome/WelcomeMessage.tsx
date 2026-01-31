import React from 'react';
import { Building, Plus, Users, Calendar, Building2, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';

interface WelcomeMessageProps {
  hasCabinets: boolean;
  hasPatients: boolean;
  userName?: string;
  isDemoMode?: boolean;
}

export function WelcomeMessage({ hasCabinets, hasPatients, userName, isDemoMode }: WelcomeMessageProps) {
  // Si l'utilisateur a déjà tout configuré (et pas en démo), ne pas afficher
  if (!isDemoMode && hasCabinets && hasPatients) {
    return null;
  }
  
  // Message spécial pour le mode démo
  if (isDemoMode) {
    return (
      <Alert className="mb-8 border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800">
        <Building className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800 dark:text-purple-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <strong>Bienvenue en mode démo !</strong>
            </div>
            <p className="text-sm">
              Explorez toutes les fonctionnalités de OstéoPraxis avec des données fictives. 
              Testez la gestion de patients, les rendez-vous, la facturation et bien plus encore.
            </p>
            <Button asChild size="sm" className="w-fit">
              <Link to="/register" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Créer mon compte gratuitement
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Message de bienvenue personnalisé */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
        <Building className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="space-y-3">
            <div>
              <strong>
                {userName ? `Bienvenue ${userName} !` : 'Bienvenue dans votre espace OstéoPraxis !'}
              </strong>
            </div>
            
            {!hasCabinets && (
              <div className="space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Étape 1 :</strong> Créez votre premier cabinet pour commencer à gérer vos patients et rendez-vous.</span>
                </p>
                <Button asChild size="sm" className="w-fit">
                  <Link to="/cabinets/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Créer mon cabinet
                  </Link>
                </Button>
              </div>
            )}
            
            {hasCabinets && !hasPatients && (
              <div className="space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <strong>Cabinet configuré !</strong>
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Étape 2 :</strong> Ajoutez vos premiers patients pour commencer à utiliser toutes les fonctionnalités.</span>
                </p>
                <Button asChild size="sm" className="w-fit">
                  <Link to="/patients/new" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Ajouter un patient
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Aide rapide */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
        <Calendar className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0" />
              <strong>Une fois configuré, vous pourrez :</strong>
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Gérer vos patients et leurs dossiers</li>
              <li>• Planifier et suivre vos rendez-vous</li>
              <li>• Créer et envoyer des factures</li>
              <li>• Accéder à vos statistiques</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}