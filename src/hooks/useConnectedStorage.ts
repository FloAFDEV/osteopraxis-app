/**
 * 🔐 Hook de stockage connecté UNIQUEMENT - JAMAIS en mode démo
 * 
 * Gère le stockage HDS sécurisé pour les utilisateurs authentifiés
 * Complètement séparé du mode démo pour éviter toute interférence
 */

import { useState, useEffect, useCallback } from 'react';
import { hdsSecureManager, type HDSSecureStatus } from '@/services/hds-secure-storage/hds-secure-manager';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoSession } from '@/utils/demo-detection';

interface UseConnectedStorageReturn {
  status: HDSSecureStatus | null;
  isLoading: boolean;
  isSetupRequired: boolean;
  isUnlocked: boolean;
  initialize: () => Promise<void>;
  unlock: (credential: string) => Promise<boolean>;
  lock: () => void;
  refresh: () => Promise<void>;
  configure: (config: HDSSecureConfigInput) => Promise<void>;
}

interface HDSSecureConfigInput {
  directoryHandle: FileSystemDirectoryHandle;
  password: string;
  confirmPassword: string;
}

export const useConnectedStorage = (): UseConnectedStorageReturn => {
  const { user } = useAuth();
  const [status, setStatus] = useState<HDSSecureStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérification de sécurité : JAMAIS en mode démo
  const ensureConnectedMode = useCallback(async () => {
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      throw new Error('🚨 VIOLATION SÉCURITÉ: Hook connecté appelé en mode démo');
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      await ensureConnectedMode();
      const storageStatus = await hdsSecureManager.getStatus();
      setStatus(storageStatus);
      return storageStatus;
    } catch (error) {
      console.error('Failed to load connected storage status:', error);
      toast.error('Erreur lors du chargement du statut de stockage sécurisé');
      return null;
    }
  }, [ensureConnectedMode]);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      await ensureConnectedMode();
      
      console.log('🔐 Initialisation stockage HDS sécurisé pour utilisateur connecté...');
      
      // Vérifier le support du stockage sécurisé
      const support = hdsSecureManager.checkSupport();
      console.log('🔍 Support stockage sécurisé:', support);
      
      if (!support.supported) {
        console.warn('⚠️ Stockage sécurisé HDS non supporté sur ce navigateur');
        setStatus({
          isConfigured: false,
          isUnlocked: false,
          physicalStorageAvailable: false,
          entitiesCount: {},
          totalSize: 0,
          integrityStatus: {}
        });
        setIsLoading(false);
        return;
      }
      
      // Vérifier si déjà configuré depuis localStorage
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
        console.log('✅ Stockage HDS sécurisé déjà configuré - Chargement du statut');
        const storageStatus = await loadStatus();
        console.log('📊 Statut stockage sécurisé:', storageStatus);
      }
      
      console.log('🎉 INITIALISATION RÉUSSIE: Stockage HDS sécurisé opérationnel');
      
    } catch (error) {
      console.error('❌ ÉCHEC INITIALISATION STOCKAGE HDS SÉCURISÉ:', error);
      toast.error('ERREUR CRITIQUE: Impossible d\'initialiser le stockage HDS sécurisé');
      
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
  }, [loadStatus, ensureConnectedMode]);

  const configure = useCallback(async (config: HDSSecureConfigInput): Promise<void> => {
    try {
      await ensureConnectedMode();
      
      console.log('🔧 Configuration du stockage HDS sécurisé...');
      
      // Configurer le gestionnaire HDS sécurisé
      await hdsSecureManager.configure({
        directoryHandle: config.directoryHandle,
        password: config.password,
        entities: ['patients', 'appointments', 'invoices']
      });
      
      // Recharger le statut après configuration
      await loadStatus();
      
      console.log('✅ Configuration HDS sécurisé terminée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur configuration HDS sécurisé:', error);
      throw error;
    }
  }, [loadStatus, ensureConnectedMode]);

  const unlock = useCallback(async (credential: string): Promise<boolean> => {
    try {
      await ensureConnectedMode();
      const success = await hdsSecureManager.unlock(credential);
      
      if (success) {
        await loadStatus();
        toast.success('Stockage HDS sécurisé déverrouillé avec succès');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unlock connected storage:', error);
      toast.error('Erreur lors du déverrouillage du stockage sécurisé');
      return false;
    }
  }, [loadStatus, ensureConnectedMode]);

  const lock = useCallback(() => {
    hdsSecureManager.lock();
    setStatus(prev => prev ? { ...prev, isUnlocked: false } : null);
    toast.info('Stockage HDS sécurisé verrouillé');
  }, []);

  const refresh = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  // Initialisation au montage du hook ET à chaque changement d'utilisateur
  useEffect(() => {
    // Vérifier d'abord qu'on n'est pas en mode démo avant d'initialiser
    isDemoSession().then(isDemoMode => {
      if (!isDemoMode && user) {
        console.log('🔐 Utilisateur connecté détecté - Initialisation stockage HDS');
        initialize();
      } else if (isDemoMode) {
        console.log('🎭 Mode démo détecté - Hook connecté ignoré');
        setIsLoading(false);
      } else {
        console.log('⏳ Pas d\'utilisateur - En attente de connexion');
        setIsLoading(false);
      }
    });
  }, [user?.id]); // Dépend de l'utilisateur pour réinitialiser à chaque connexion

  return {
    status,
    isLoading,
    isSetupRequired: status ? !status.isConfigured : true,
    isUnlocked: status?.isUnlocked || false,
    initialize,
    configure,
    unlock,
    lock,
    refresh
  };
};