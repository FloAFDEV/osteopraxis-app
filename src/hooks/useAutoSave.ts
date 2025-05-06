
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

type SaveFunction<T> = (data: T) => Promise<void>;

interface AutoSaveOptions {
  interval?: number;
  onlySaveOnChanges?: boolean;
  debounceMs?: number;
  notifyOnSave?: boolean;
}

export function useAutoSave<T>(
  data: T,
  saveFunction: SaveFunction<T>,
  options: AutoSaveOptions = {}
) {
  const {
    interval = 30000,
    onlySaveOnChanges = true,
    debounceMs = 1000,
    notifyOnSave = false
  } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const previousDataRef = useRef<T>(data);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fonction pour comparer si les données ont changé
  const hasDataChanged = () => {
    return JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
  };

  // Fonction de sauvegarde
  const saveData = async () => {
    if (onlySaveOnChanges && !hasDataChanged()) {
      return;
    }
    
    try {
      setIsSaving(true);
      await saveFunction(data);
      setLastSaved(new Date());
      setError(null);
      previousDataRef.current = JSON.parse(JSON.stringify(data));
      
      if (notifyOnSave) {
        toast.success("Session auto-sauvegardée");
      }
    } catch (err) {
      console.error("Erreur lors de l'auto-sauvegarde:", err);
      setError(err instanceof Error ? err : new Error('Erreur de sauvegarde'));
      
      toast.error("Échec de l'auto-sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction de sauvegarde avec debounce
  const debouncedSave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveData();
    }, debounceMs);
  };

  // Fonction de sauvegarde manuelle
  const save = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    await saveData();
  };

  // Configurer l'intervalle d'auto-sauvegarde
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      saveData();
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, interval]);

  // Détection des changements pour sauvegarde immédiate
  useEffect(() => {
    if (hasDataChanged()) {
      debouncedSave();
    }
  }, [data]);

  return {
    lastSaved,
    isSaving,
    error,
    save,
    debouncedSave
  };
}
