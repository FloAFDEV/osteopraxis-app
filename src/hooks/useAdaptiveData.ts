import { useMode } from '@/contexts/ModeContext';
import { AdaptiveDataService } from '@/services/AdaptiveDataService';
import { useMemo } from 'react';

export function useAdaptiveData() {
  const { mode } = useMode();
  
  const dataService = useMemo(() => {
    try {
      return AdaptiveDataService.getInstance(mode);
    } catch (error) {
      // Fallback to demo mode if production mode is not implemented
      return AdaptiveDataService.getInstance('demo');
    }
  }, [mode]);

  return dataService;
}