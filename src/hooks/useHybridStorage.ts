import { useState, useEffect, useCallback } from 'react';
import { hdsSecureManager, type HDSSecureStatus } from '@/services/hds-secure-storage/hds-secure-manager';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UseHybridStorageReturn {
  status: HDSSecureStatus | null;
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
  const [status, setStatus] = useState<HDSSecureStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérifier si c'est un utilisateur démo (même logique que AuthContext)
  const isDemoUser = user?.email === 'demo@patienthub.com' || 
                     user?.email?.startsWith('demo-') ||
                     (user as any)?.is_demo === true ||
                     (user as any)?.is_demo_user === true;

  const loadStatus = useCallback(async () => {
    try {
      const storageStatus = await hdsSecureManager.getStatus();
      setStatus(storageStatus);
      return storageStatus;
    } catch (error) {
      console.error('Failed to load secure storage status:', error);
      toast.error('Erreur lors du chargement du statut de stockage sécurisé');
      return null;
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // En mode démo uniquement, bypass complet du stockage sécurisé
      if (isDemoUser) {
        console.log('🎭 Utilisateur démo détecté - Aucun stockage sécurisé requis');
        setStatus({
          isConfigured: true,
          isUnlocked: true,
          physicalStorageAvailable: false,
          entitiesCount: {},
          totalSize: 0,
          integrityStatus: {}
        });
        setIsLoading(false);
        return;
      }
      
      console.log('🔐 Utilisateur réel - Initialisation stockage HDS sécurisé obligatoire...');
      
      // Vérifier le support du stockage sécurisé
      const support = hdsSecureManager.checkSupport();
      console.log('🔍 Support stockage sécurisé:', support);
      
      if (!support.supported) {
        // En environnement iframe (preview), simuler un stockage configuré
        console.warn('⚠️ Stockage sécurisé non supporté (iframe) - Mode simulation');
        setStatus({
          isConfigured: true,
          isUnlocked: true,
          physicalStorageAvailable: false,
          entitiesCount: {},
          totalSize: 0,
          integrityStatus: {}
        });
        setIsLoading(false);
        return;
      }
      
      // Vérifier si déjà configuré
      const isConfigured = hdsSecureManager.isConfiguredFromStorage();
      
      if (!isConfigured) {
        console.log('⚙️ Stockage HDS sécurisé non configuré - Configuration requise');
        setStatus({
          isConfigured: false,
          isUnlocked: false,
          physicalStorageAvailable: false,
          entitiesCount: {},
          totalSize: 0,
          integrityStatus: {}
        });
      } else {
        console.log('✅ Stockage HDS sécurisé déjà configuré');
        const storageStatus = await loadStatus();
        console.log('📊 Statut stockage sécurisé:', storageStatus);
      }
      
      console.log('🎉 INITIALISATION RÉUSSIE: Stockage HDS sécurisé opérationnel');
      
    } catch (error) {
      console.error('❌ ÉCHEC INITIALISATION STOCKAGE HDS SÉCURISÉ:', error);
      toast.error('ERREUR CRITIQUE: Impossible d\'initialiser le stockage HDS sécurisé');
      
      // En cas d'échec, mettre un statut d'erreur
      setStatus({
        isConfigured: false,
        isUnlocked: false,
        physicalStorageAvailable: false,
        entitiesCount: {},
        totalSize: 0,
        integrityStatus: {}
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadStatus, isDemoUser]);

  const unlock = useCallback(async (credential: string): Promise<boolean> => {
    try {
      const success = await hdsSecureManager.unlock(credential);
      
      if (success) {
        await loadStatus();
        toast.success('Stockage HDS sécurisé déverrouillé avec succès');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unlock secure storage:', error);
      toast.error('Erreur lors du déverrouillage du stockage sécurisé');
      return false;
    }
  }, [loadStatus]);

  const lock = useCallback(() => {
    hdsSecureManager.lock();
    setStatus(prev => prev ? { ...prev, isUnlocked: false } : null);
    toast.info('Stockage HDS sécurisé verrouillé');
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