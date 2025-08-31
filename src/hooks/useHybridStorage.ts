import { useState, useEffect, useCallback } from 'react';
import { nativeStorageManager, type NativeStorageStatus } from '@/services/native-file-storage/native-storage-manager';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UseHybridStorageReturn {
  status: NativeStorageStatus | null;
  isLoading: boolean;
  isSetupRequired: boolean;
  isUnlocked: boolean;
  initialize: () => Promise<void>;
  unlock: (credential: string) => Promise<boolean>;
  lock: () => void;
  refresh: () => Promise<void>;
}

export const useHybridStorage = (): UseHybridStorageReturn => {
  const { user } = useAuth();
  const [status, setStatus] = useState<NativeStorageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérifier si c'est un utilisateur démo (même logique que AuthContext)
  const isDemoUser = user?.email === 'demo@patienthub.com' || 
                     user?.email?.startsWith('demo-') ||
                     (user as any)?.is_demo === true ||
                     (user as any)?.is_demo_user === true;

  const loadStatus = useCallback(async () => {
    try {
      const storageStatus = await nativeStorageManager.getStatus();
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
      
      // En mode démo uniquement, bypass complet du stockage local
      if (isDemoUser) {
        console.log('🎭 Utilisateur démo détecté - Aucun stockage local requis');
        setStatus({
          isConfigured: true,
          isUnlocked: true,
          localAvailable: false,
          cloudAvailable: false, // Démo utilise localStorage uniquement
          entitiesCount: {},
          totalSize: 0
        });
        setIsLoading(false);
        return;
      }
      
      console.log('🔧 Utilisateur réel - Initialisation stockage natif obligatoire...');
      
      // Vérifier le support du stockage natif
      const support = nativeStorageManager.checkSupport();
      console.log('🔍 Support stockage natif:', support);
      
      if (!support.supported) {
        // En environnement iframe (preview), simuler un stockage configuré
        console.warn('⚠️ Stockage natif non supporté (iframe) - Mode simulation');
        setStatus({
          isConfigured: true,
          isUnlocked: true,
          localAvailable: false,
          cloudAvailable: true,
          entitiesCount: {},
          totalSize: 0
        });
        setIsLoading(false);
        return;
      }
      
      // Vérifier si déjà configuré
      const isConfigured = nativeStorageManager.isConfiguredFromStorage();
      
      if (!isConfigured) {
        console.log('⚙️ Stockage natif non configuré - Configuration requise');
        setStatus({
          isConfigured: false,
          isUnlocked: false,
          localAvailable: false,
          cloudAvailable: true,
          entitiesCount: {},
          totalSize: 0
        });
      } else {
        console.log('✅ Stockage natif déjà configuré');
        const storageStatus = await loadStatus();
        console.log('📊 Statut stockage:', storageStatus);
      }
      
      console.log('🎉 INITIALISATION RÉUSSIE: Stockage natif opérationnel');
      
    } catch (error) {
      console.error('❌ ÉCHEC INITIALISATION STOCKAGE NATIF:', error);
      toast.error('ERREUR CRITIQUE: Impossible d\'initialiser le stockage local sécurisé');
      
      // En cas d'échec, mettre un statut d'erreur
      setStatus({
        isConfigured: false,
        isUnlocked: false,
        localAvailable: false,
        cloudAvailable: true,
        entitiesCount: {},
        totalSize: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadStatus, isDemoUser]);

  const unlock = useCallback(async (credential: string): Promise<boolean> => {
    try {
      const success = await nativeStorageManager.unlock(credential);
      
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
    nativeStorageManager.lock();
    setStatus(prev => prev ? { ...prev, isUnlocked: false } : null);
    toast.info('Stockage verrouillé');
  }, []);

  const refresh = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  // Initialisation au montage du hook - Une seule fois
  useEffect(() => {
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pas d'auto-refresh pour éviter les boucles - sera fait manuellement si nécessaire

  return {
    status,
    isLoading,
    isSetupRequired: isDemoUser ? false : (status ? !status.isConfigured : true),
    isUnlocked: isDemoUser ? true : (status?.isUnlocked || false),
    initialize,
    unlock,
    lock,
    refresh
  };
};