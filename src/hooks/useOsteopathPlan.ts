/**
 * Hook pour récupérer le plan tarifaire de l'ostéopathe actuel
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type OsteopathPlan = 'light' | 'full' | 'pro';

interface OsteopathPlanData {
  plan: OsteopathPlan;
  loading: boolean;
  error: Error | null;
}

export const useOsteopathPlan = (): OsteopathPlanData => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['osteopath-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { plan: 'light' as OsteopathPlan };
      }

      const { data, error } = await supabase
        .from('Osteopath')
        .select('plan')
        .or(`authId.eq.${user.id},userId.eq.${user.id}`)
        .single();

      if (error) {
        console.error('Erreur récupération plan ostéopathe:', error);
        return { plan: 'light' as OsteopathPlan };
      }

      return { plan: (data?.plan as OsteopathPlan) || 'light' };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    plan: data?.plan || 'light',
    loading: isLoading,
    error: error as Error | null,
  };
};

/**
 * Hook pour vérifier si une fonctionnalité est accessible selon le plan
 */
export const useFeatureAccess = () => {
  const { plan } = useOsteopathPlan();

  return {
    canAccessAppointments: plan === 'full' || plan === 'pro',
    canAccessInvoices: plan === 'full' || plan === 'pro',
    canAccessSchedule: plan === 'full' || plan === 'pro',
    canAccessTeam: plan === 'pro',
    canAccessPatients: true, // Disponible pour tous les plans
    plan,
  };
};
