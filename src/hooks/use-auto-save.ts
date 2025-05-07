
import { useState, useEffect, useRef } from 'react';

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  interval?: number;
  debounce?: number;
  enabled?: boolean;
}

/**
 * Custom hook for handling auto-save functionality
 */
export const useAutoSave = ({
  onSave,
  interval = 30000,
  debounce = 1000,
  enabled = true
}: UseAutoSaveOptions) => {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef<boolean>(false);

  // Function to mark content as dirty (needs saving)
  const setDirty = () => {
    isDirtyRef.current = true;
    
    // Clear any existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set up new debounce timer
    if (enabled) {
      debounceRef.current = setTimeout(() => {
        save();
      }, debounce);
    }
  };

  // Function to perform the save
  const save = async () => {
    if (!isDirtyRef.current || !enabled) return;
    
    setStatus('saving');
    try {
      await onSave();
      setStatus('saved');
      isDirtyRef.current = false;
      setLastSaved(new Date());
      
      // Reset status to idle after a delay
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setStatus('error');
      
      // Reset status to idle after error
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }
  };

  // Set up interval for periodic saving
  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        if (isDirtyRef.current) {
          save();
        }
      }, interval);
    }
    
    return () => {
      // Clean up timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, interval]);

  // Force an immediate save
  const forceSave = async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    await save();
  };

  return {
    status,
    lastSaved,
    setDirty,
    forceSave,
    isSaving: status === 'saving',
    isError: status === 'error',
    isSaved: status === 'saved',
  };
};
