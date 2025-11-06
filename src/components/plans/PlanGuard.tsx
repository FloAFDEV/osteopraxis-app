/**
 * Garde pour protéger les fonctionnalités selon le plan de l'utilisateur
 */

import { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useOsteopathPlan';
import { FeatureLockedBanner } from './FeatureLockedBanner';
import { useDemo } from '@/contexts/DemoContext';

interface PlanGuardProps {
  feature: 'appointments' | 'invoices' | 'schedule' | 'team';
  children: ReactNode;
  fallback?: ReactNode;
}

const FEATURE_CONFIG = {
  appointments: {
    name: 'Gestion des rendez-vous',
    description: 'Accédez à votre agenda complet, gérez vos rendez-vous et envoyez des rappels automatiques avec le plan Full.',
  },
  invoices: {
    name: 'Facturation',
    description: 'Créez et gérez vos factures professionnelles, suivez les paiements et exportez en PDF avec le plan Full.',
  },
  schedule: {
    name: 'Planning hebdomadaire',
    description: 'Visualisez votre planning de la semaine avec une vue d\'ensemble de tous vos rendez-vous avec le plan Full.',
  },
  team: {
    name: 'Gestion d\'équipe',
    description: 'Gérez votre équipe de praticiens et collaborez efficacement avec le plan Pro.',
  },
};

export const PlanGuard = ({ feature, children, fallback }: PlanGuardProps) => {
  const { isDemoMode } = useDemo();
  const featureAccess = useFeatureAccess();

  // En mode démo, tout est accessible
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Vérifier l'accès selon la fonctionnalité
  const hasAccess = 
    (feature === 'appointments' && featureAccess.canAccessAppointments) ||
    (feature === 'invoices' && featureAccess.canAccessInvoices) ||
    (feature === 'schedule' && featureAccess.canAccessSchedule) ||
    (feature === 'team' && featureAccess.canAccessTeam);

  if (!hasAccess) {
    const config = FEATURE_CONFIG[feature];
    
    return (
      <div className="container mx-auto px-4 py-8">
        {fallback || (
          <FeatureLockedBanner
            featureName={config.name}
            description={config.description}
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
};
