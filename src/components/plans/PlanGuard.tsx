/**
 * PlanGuard - Accès complet pour tous
 *
 * Simplifié : Plus de barrière artificielle
 * L'offre est unique à 49€ - Accès total pour démo et inscrits
 */

import { ReactNode } from 'react';

interface PlanGuardProps {
  children: ReactNode;
  feature: 'appointments' | 'invoices' | 'schedule' | 'team' | 'analytics';
}

export function PlanGuard({ children }: PlanGuardProps) {
  // 🎯 Simplicité : Accès complet pour tous (démo et inscrits)
  // Plus de restriction - l'offre est unique
  return <>{children}</>;
}
