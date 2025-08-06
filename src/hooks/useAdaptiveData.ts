
import { useMode } from '@/contexts/ModeContext';
import { NewAdaptiveDataService } from '@/services/NewAdaptiveDataService';
import { useMemo } from 'react';

export function useAdaptiveData() {
  const { mode, getDemoSessionId } = useMode();
  
  const dataService = useMemo(() => {
    const sessionId = mode === 'demo' ? getDemoSessionId() : undefined;
    return NewAdaptiveDataService.getInstance(mode, sessionId);
  }, [mode, getDemoSessionId]);

  return dataService;
}
