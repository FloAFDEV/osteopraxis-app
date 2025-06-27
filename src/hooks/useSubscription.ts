
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end?: string;
  loading: boolean;
  error?: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'Gratuit',
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user) {
      setSubscriptionData({
        subscribed: false,
        subscription_tier: 'Gratuit',
        loading: false,
      });
      return;
    }

    try {
      setSubscriptionData(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || 'Gratuit',
        subscription_end: data.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionData({
        subscribed: false,
        subscription_tier: 'Gratuit',
        loading: false,
        error: error.message,
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    ...subscriptionData,
    refreshSubscription: checkSubscription,
  };
}
