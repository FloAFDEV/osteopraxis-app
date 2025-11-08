/**
 * PlanGuard - Contrôle d'accès basé sur le plan d'abonnement
 * 
 * Restreint l'accès aux fonctionnalités selon le plan:
 * - Light: gestion des patients uniquement
 * - Full: patients + rendez-vous + facturation + planning
 * - Pro: Full + gestion d'équipe + analytics avancées
 */

import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Osteopath } from '@/types';
import { SmartUpgradeBanner } from './SmartUpgradeBanner';
import { useUsageMetrics } from '@/hooks/useUsageMetrics';

interface PlanGuardProps {
  children: ReactNode;
  feature: 'appointments' | 'invoices' | 'schedule' | 'team' | 'analytics';
}

const FEATURE_REQUIREMENTS = {
  appointments: ['full', 'pro'],
  invoices: ['full', 'pro'],
  schedule: ['full', 'pro'],
  team: ['pro'],
  analytics: ['pro']
} as const;

const FEATURE_NAMES = {
  appointments: 'Gestion des rendez-vous',
  invoices: 'Facturation',
  schedule: 'Planning hebdomadaire',
  team: 'Gestion d\'équipe',
  analytics: 'Analytics avancées'
} as const;

const PLAN_NAMES = {
  light: 'Light',
  full: 'Full',
  pro: 'Pro'
} as const;

export function PlanGuard({ children, feature }: PlanGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const { trackFeatureAttempt } = useUsageMetrics();

  useEffect(() => {
    const loadOsteopath = async () => {
      if (!user?.osteopathId) {
        setIsLoading(false);
        return;
      }

      try {
        const osteopathData = await api.getOsteopathById(user.osteopathId);
        setOsteopath(osteopathData);
      } catch (error) {
        console.error('Erreur chargement ostéopathe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOsteopath();
  }, [user]);

  useEffect(() => {
    // Compter les tentatives d'accès pour analyse d'utilisation
    const key = `upgrade-attempts-${feature}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    setAttempts(count + 1);
    localStorage.setItem(key, (count + 1).toString());
    
    // Tracker dans les métriques d'utilisation
    trackFeatureAttempt(feature);
  }, [feature, trackFeatureAttempt]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a le plan requis
  const requiredPlans = FEATURE_REQUIREMENTS[feature];
  const currentPlan = osteopath?.plan || 'light';
  const hasAccess = requiredPlans.includes(currentPlan as any);

  if (!hasAccess) {
    // Bloquer l'accès et afficher bannière d'upgrade
    const suggestedPlan = feature === 'team' || feature === 'analytics' ? 'Pro' : 'Full';
    const pricing = suggestedPlan === 'Pro' ? '49€/mois' : '19€/mois';

    // Toast de blocage
    toast.error(`Accès réservé au plan ${suggestedPlan}`, {
      description: `Cette fonctionnalité nécessite le plan ${suggestedPlan}`,
      duration: 5000,
    });

    return (
      <div className="container mx-auto py-10 px-4">
        <SmartUpgradeBanner feature={feature} currentPlan={currentPlan as any} />

        {/* Affichage visuel de verrouillage */}
        <div className="max-w-2xl mx-auto mt-8 p-8 border-2 border-dashed rounded-lg bg-muted/20 flex flex-col items-center justify-center text-center space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground">
            Fonctionnalité non disponible
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {FEATURE_NAMES[feature]} est disponible dans le plan {suggestedPlan}. 
            Consultez nos offres pour accéder à cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // Accès autorisé
  return <>{children}</>;
}
