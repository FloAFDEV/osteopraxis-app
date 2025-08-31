
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  showToasts?: boolean;
}

interface RetryState {
  loading: boolean;
  error: Error | null;
  retryCount: number;
}

export function useRetryableRequest<T extends any[], R>(
  requestFn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    showToasts = true
  } = options;

  const [state, setState] = useState<RetryState>({
    loading: false,
    error: null,
    retryCount: 0
  });

  const executeRequest = useCallback(async (...args: T): Promise<R> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    let lastError: Error;
    let delay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn(...args);
        setState({ loading: false, error: null, retryCount: attempt });
        
        if (showToasts && attempt > 0) {
          toast.success(`Requête réussie après ${attempt} tentative(s)`);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          setState(prev => ({ ...prev, retryCount: attempt + 1 }));
          
          if (showToasts) {
            toast.warning(`Tentative ${attempt + 1}/${maxRetries + 1} échouée. Nouvelle tentative dans ${delay}ms...`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        } else {
          setState({ loading: false, error: lastError, retryCount: attempt });
          
          if (showToasts) {
            toast.error(`Échec après ${maxRetries + 1} tentatives: ${lastError.message}`);
          }
          
          throw lastError;
        }
      }
    }

    throw lastError!;
  }, [requestFn, maxRetries, retryDelay, backoffMultiplier, showToasts]);

  const retry = useCallback((...args: T) => {
    return executeRequest(...args);
  }, [executeRequest]);

  return {
    execute: executeRequest,
    retry,
    loading: state.loading,
    error: state.error,
    retryCount: state.retryCount
  };
}
