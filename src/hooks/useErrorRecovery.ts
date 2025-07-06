import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook pour la gestion d'erreurs et récupération automatique
 */

interface ErrorState {
  error: Error | null;
  retryCount: number;
  isRecovering: boolean;
  lastErrorTime: number;
}

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  showToast?: boolean;
  onError?: (error: Error, retryCount: number) => void;
  onRecovered?: () => void;
}

export const useErrorRecovery = (options: ErrorRecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    showToast = true,
    onError,
    onRecovered,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    retryCount: 0,
    isRecovering: false,
    lastErrorTime: 0,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const calculateDelay = useCallback((retryCount: number) => {
    if (!exponentialBackoff) return retryDelay;
    return retryDelay * Math.pow(2, retryCount);
  }, [retryDelay, exponentialBackoff]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: 0,
    });
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Opération'
  ): Promise<T | null> => {
    try {
      setErrorState(prev => ({ ...prev, isRecovering: true }));
      
      const result = await operation();
      
      // Succès - nettoyer l'état d'erreur
      if (errorState.error && onRecovered) {
        onRecovered();
      }
      clearError();
      
      return result;
    } catch (error) {
      const currentError = error as Error;
      const newRetryCount = errorState.retryCount + 1;
      const now = Date.now();
      
      setErrorState({
        error: currentError,
        retryCount: newRetryCount,
        isRecovering: false,
        lastErrorTime: now,
      });

      // Appeler le callback d'erreur
      if (onError) {
        onError(currentError, newRetryCount);
      }

      // Afficher le toast d'erreur
      if (showToast) {
        if (newRetryCount <= maxRetries) {
          toast.error(
            `${operationName} échoué. Nouvelle tentative dans ${calculateDelay(newRetryCount - 1)}ms...`,
            { duration: 3000 }
          );
        } else {
          toast.error(
            `${operationName} échoué après ${maxRetries} tentatives. Veuillez réessayer manuellement.`,
            { duration: 5000 }
          );
        }
      }

      // Programmer une nouvelle tentative si possible
      if (newRetryCount <= maxRetries) {
        const delay = calculateDelay(newRetryCount - 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          executeWithRecovery(operation, operationName);
        }, delay);
      }

      throw currentError;
    }
  }, [errorState, maxRetries, onError, onRecovered, showToast, calculateDelay, clearError]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Opération'
  ) => {
    // Réinitialiser le compteur pour un retry manuel
    setErrorState(prev => ({ ...prev, retryCount: 0 }));
    return executeWithRecovery(operation, operationName);
  }, [executeWithRecovery]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    error: errorState.error,
    retryCount: errorState.retryCount,
    isRecovering: errorState.isRecovering,
    hasError: !!errorState.error,
    canRetry: errorState.retryCount < maxRetries,
    executeWithRecovery,
    retry,
    clearError,
  };
};

// Hook pour la gestion globale des erreurs avec fallbacks
export const useGlobalErrorHandler = () => {
  const [criticalErrors, setCriticalErrors] = useState<Error[]>([]);
  
  const handleCriticalError = useCallback((error: Error, context?: string) => {
    console.error(`Erreur critique${context ? ` dans ${context}` : ''}:`, error);
    
    setCriticalErrors(prev => {
      // Éviter les doublons
      if (prev.some(e => e.message === error.message)) {
        return prev;
      }
      return [...prev, error];
    });
    
    // Toast pour les erreurs critiques
    toast.error(
      `Erreur système${context ? ` (${context})` : ''}. L'équipe technique a été notifiée.`,
      { duration: 5000 }
    );
  }, []);

  const clearCriticalErrors = useCallback(() => {
    setCriticalErrors([]);
  }, []);

  // Error boundary hook
  const createErrorBoundary = useCallback((componentName: string) => {
    return (error: Error, errorInfo: any) => {
      handleCriticalError(error, componentName);
    };
  }, [handleCriticalError]);

  return {
    criticalErrors,
    hasCriticalErrors: criticalErrors.length > 0,
    handleCriticalError,
    clearCriticalErrors,
    createErrorBoundary,
  };
};

// Hook pour la validation avec récupération
export const useValidationWithRecovery = <T>(
  validationFn: (value: T) => string | null,
  autoCorrect?: (value: T) => T
) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [correctedValue, setCorrectedValue] = useState<T | null>(null);

  const validate = useCallback((value: T): { isValid: boolean; corrected?: T } => {
    const error = validationFn(value);
    
    if (error) {
      setErrors(prev => [...prev, error]);
      
      // Tentative de correction automatique
      if (autoCorrect) {
        try {
          const corrected = autoCorrect(value);
          const correctedError = validationFn(corrected);
          
          if (!correctedError) {
            setCorrectedValue(corrected);
            toast.success('Valeur corrigée automatiquement');
            return { isValid: true, corrected };
          }
        } catch (correctionError) {
          console.warn('Échec de la correction automatique:', correctionError);
        }
      }
      
      return { isValid: false };
    }
    
    // Succès - nettoyer les erreurs
    setErrors([]);
    setCorrectedValue(null);
    return { isValid: true };
  }, [validationFn, autoCorrect]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setCorrectedValue(null);
  }, []);

  return {
    validate,
    errors,
    hasErrors: errors.length > 0,
    correctedValue,
    clearErrors,
  };
};