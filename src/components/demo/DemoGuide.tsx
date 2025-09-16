import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  X,
  ArrowRight,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const demoSteps: GuideStep[] = [
  {
    id: 'patients',
    title: 'Gérer vos Patients',
    description: 'Créez et consultez des dossiers patients complets avec historique médical',
    icon: <Users className="h-5 w-5" />,
    path: '/patients',
    badge: 'Essentiel'
  },
  {
    id: 'appointments',
    title: 'Planifier des Séances',
    description: 'Organisez vos rendez-vous et suivez leur statut en temps réel',
    icon: <Calendar className="h-5 w-5" />,
    path: '/appointments',
    badge: 'Populaire'
  },
  {
    id: 'schedule',
    title: 'Consulter le Planning',
    description: 'Visualisez votre agenda en vue journalière, hebdomadaire ou mensuelle',
    icon: <Calendar className="h-5 w-5" />,
    path: '/schedule'
  },
  {
    id: 'invoices',
    title: 'Facturation',
    description: 'Générez et gérez vos factures avec conformité TVA',
    icon: <CreditCard className="h-5 w-5" />,
    path: '/invoices'
  }
];

export const DemoGuide: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    if (!isDemoMode) return;

    // Rediriger vers le dashboard en mode démo
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isDemoMode, location.pathname, navigate]);

  if (!isVisible || !isDemoMode) {
    return null;
  }

  const handleStepClick = (step: GuideStep) => {
    navigate(step.path);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full dark:bg-amber-900/50">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mode Démo Actif
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-200">
                Explorez toutes les fonctionnalités avec des données de test
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoSteps.map((step, index) => (
            <div
              key={step.id}
              className="group cursor-pointer"
              onClick={() => handleStepClick(step)}
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-105 border-amber-200 hover:border-amber-300 dark:border-amber-700 dark:hover:border-amber-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors dark:bg-amber-900/50 dark:group-hover:bg-amber-800/60">
                      {step.icon}
                    </div>
                    {step.badge && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
                        {step.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-amber-900 mb-2 group-hover:text-amber-800 dark:text-amber-100 dark:group-hover:text-amber-200">
                    {step.title}
                  </h4>
                  
                  <p className="text-xs text-amber-600 mb-3 line-clamp-2 dark:text-amber-300">
                    {step.description}
                  </p>
                  
                  <div className="flex items-center text-amber-700 group-hover:text-amber-800 transition-colors dark:text-amber-300 dark:group-hover:text-amber-200">
                    <span className="text-xs font-medium">Explorer</span>
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-100 rounded-lg dark:bg-amber-900/30">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0 dark:text-amber-400" />
            <div className="text-xs text-amber-700 dark:text-amber-200">
              <strong>Conseil :</strong> Les données créées en mode démo sont temporaires et seront supprimées après 30 minutes. 
              Parfait pour tester sans risque !
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};