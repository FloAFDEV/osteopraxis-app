
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitHookReturn {
  checkRateLimit: (endpoint: string, maxRequests?: number, windowMinutes?: number) => Promise<boolean>;
  isRateLimited: boolean;
}

export function useRateLimit(): RateLimitHookReturn {
  const [isRateLimited, setIsRateLimited] = useState(false);

  const checkRateLimit = useCallback(async (
    endpoint: string, 
    maxRequests: number = 100, 
    windowMinutes: number = 60
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Utilisateur non authentifié pour la vérification du rate limit');
        return false;
      }

      const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_endpoint: endpoint,
        p_max_requests: maxRequests,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Erreur lors de la vérification du rate limit:', error);
        return true; // En cas d'erreur, on autorise pour ne pas bloquer l'utilisateur
      }

      if (!allowed) {
        setIsRateLimited(true);
        toast.error('Trop de requêtes. Veuillez patienter avant de réessayer.');
        
        // Reset le flag après la fenêtre de temps
        setTimeout(() => {
          setIsRateLimited(false);
        }, windowMinutes * 60 * 1000);
      }

      return allowed;
    } catch (error) {
      console.error('Exception lors de la vérification du rate limit:', error);
      return true; // En cas d'erreur, on autorise
    }
  }, []);

  return { checkRateLimit, isRateLimited };
}
