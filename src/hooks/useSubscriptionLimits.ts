
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionLimits {
  max_patients: number;
  max_cabinets: number;
  features: {
    invoices: boolean;
    advanced_stats: boolean;
    export: boolean;
    priority_support?: boolean;
    multi_osteopath?: boolean;
  };
  subscription_tier: string;
  loading: boolean;
}

export function useSubscriptionLimits() {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits>({
    max_patients: 5,
    max_cabinets: 1,
    features: {
      invoices: false,
      advanced_stats: false,
      export: false,
    },
    subscription_tier: 'Gratuit',
    loading: true,
  });

  const checkLimits = async () => {
    if (!user) {
      setLimits(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_subscription_limits', { user_uuid: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        const limitData = data[0];
        setLimits({
          max_patients: limitData.max_patients,
          max_cabinets: limitData.max_cabinets,
          features: limitData.features || {
            invoices: false,
            advanced_stats: false,
            export: false,
          },
          subscription_tier: limitData.subscription_tier,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      setLimits(prev => ({ ...prev, loading: false }));
    }
  };

  const canPerformAction = async (action: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('can_perform_action', { 
          user_uuid: user.id, 
          action_type: action 
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  };

  useEffect(() => {
    checkLimits();
  }, [user]);

  return {
    ...limits,
    canPerformAction,
    refreshLimits: checkLimits,
  };
}
