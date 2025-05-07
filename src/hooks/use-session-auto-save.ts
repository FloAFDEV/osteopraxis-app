
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSessionAutoSaveProps<T> {
  data: T;
  onSave: (data: T) => void;
  interval?: number;
  debounce?: number;
}

export function useSessionAutoSave<T>({
  data,
  onSave,
  interval = 30000, // Default to 30 seconds
  debounce = 1000, // Default to 1 second
}: UseSessionAutoSaveProps<T>) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);
  const isActiveRef = useRef<boolean>(true);

  // Function to save data
  const save = useCallback(() => {
    if (!isActiveRef.current) return;
    
    setIsAutoSaving(true);
    
    // Save the data
    try {
      onSave(lastDataRef.current);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [onSave]);

  // Start auto-save functionality
  const startAutoSave = useCallback(() => {
    isActiveRef.current = true;
    
    // Set interval timer for periodic saves
    if (timer.current) {
      clearInterval(timer.current);
    }
    
    timer.current = setInterval(save, interval);
  }, [save, interval]);

  // Stop auto-save functionality
  const stopAutoSave = useCallback(() => {
    isActiveRef.current = false;
    
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  // Save when data changes, with debounce
  useEffect(() => {
    if (!isActiveRef.current) return;
    
    // Update the reference to current data
    lastDataRef.current = data;
    
    // Clear any existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      save();
    }, debounce);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [data, debounce, save]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  return {
    save,
    isAutoSaving,
    lastSaved,
    startAutoSave,
    stopAutoSave
  };
}
