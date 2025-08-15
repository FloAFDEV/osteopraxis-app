import { useState, useEffect, useCallback } from 'react';
import { hybridStorageManager, type StorageStatus } from '@/services/hybrid-storage-manager';
import { toast } from 'sonner';

interface UseHybridStorageReturn {
  status: StorageStatus | null;
  isLoading: boolean;
  isSetupRequired: boolean;
  isUnlocked: boolean;
  initialize: () => Promise<void>;
  unlock: (credential: string) => Promise<boolean>;
  lock: () => void;
  refresh: () => Promise<void>;
}

export const useHybridStorage = (): UseHybridStorageReturn => {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const storageStatus = await hybridStorageManager.getStorageStatus();
      setStatus(storageStatus);
      return storageStatus;
    } catch (error) {
      console.error('Failed to load storage status:', error);
      toast.error('Erreur lors du chargement du statut de stockage');
      return null;
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      await hybridStorageManager.initialize();
      await loadStatus();
    } catch (error) {
      console.error('Failed to initialize hybrid storage:', error);
      toast.error('Erreur lors de l\'initialisation du stockage hybride');
    } finally {
      setIsLoading(false);
    }
  }, [loadStatus]);

  const unlock = useCallback(async (credential: string): Promise<boolean> => {
    try {
      const success = await hybridStorageManager.unlockStorage(credential);
      
      if (success) {
        await loadStatus();
        toast.success('Stockage déverrouillé avec succès');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unlock storage:', error);
      toast.error('Erreur lors du déverrouillage');
      return false;
    }
  }, [loadStatus]);

  const lock = useCallback(() => {
    hybridStorageManager.lockStorage();
    setStatus(prev => prev ? { ...prev, isUnlocked: false } : null);
    toast.info('Stockage verrouillé');
  }, []);

  const refresh = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  // Initialisation au montage du hook
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auto-refresh du statut toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (status?.isUnlocked) {
        loadStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status?.isUnlocked, loadStatus]);

  return {
    status,
    isLoading,
    isSetupRequired: status ? !status.isConfigured : true, // Dérivé du status plutôt qu'async
    isUnlocked: hybridStorageManager.isStorageUnlocked(),
    initialize,
    unlock,
    lock,
    refresh
  };
};