/**
 * 🔧 Hook de configuration HDS pour mode connecté UNIQUEMENT
 * 
 * Interface dédiée pour configurer le stockage HDS sécurisé
 * Complètement isolé du mode démo
 */

import { useState, useCallback } from 'react';
import { hdsSecureManager } from '@/services/hds-secure-storage/hds-secure-manager';
import { isDemoSession } from '@/utils/demo-detection';
import { toast } from 'sonner';

interface HDSConfigurationState {
  isConfiguring: boolean;
  isSupported: boolean;
  supportDetails: string[];
  error: string | null;
}

interface HDSConfigInput {
  directoryHandle: FileSystemDirectoryHandle;
  password: string;
  entities?: string[];
}

interface UseHDSConfigurationReturn extends HDSConfigurationState {
  checkSupport: () => Promise<{ supported: boolean; details: string[] }>;
  configure: (config: HDSConfigInput) => Promise<void>;
  reset: () => Promise<void>;
  verifyIntegrity: () => Promise<{ overallValid: boolean; results: Record<string, any> }>;
}

export const useHDSConfiguration = (): UseHDSConfigurationReturn => {
  const [state, setState] = useState<HDSConfigurationState>({
    isConfiguring: false,
    isSupported: true,
    supportDetails: [],
    error: null
  });

  // Vérification de sécurité : JAMAIS en mode démo
  const ensureConnectedMode = useCallback(async () => {
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      throw new Error('🚨 VIOLATION SÉCURITÉ: Configuration HDS appelée en mode démo');
    }
  }, []);

  const checkSupport = useCallback(async () => {
    try {
      await ensureConnectedMode();
      
      const support = hdsSecureManager.checkSupport();
      
      setState(prev => ({
        ...prev,
        isSupported: support.supported,
        supportDetails: support.details,
        error: null
      }));
      
      return support;
      
    } catch (error) {
      console.error('❌ Erreur vérification support HDS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: errorMessage
      }));
      
      return { supported: false, details: [errorMessage] };
    }
  }, [ensureConnectedMode]);

  const configure = useCallback(async (config: HDSConfigInput) => {
    try {
      await ensureConnectedMode();
      
      setState(prev => ({ ...prev, isConfiguring: true, error: null }));
      
      console.log('🔧 Début configuration HDS sécurisé...');
      
      // Vérifier le support avant configuration
      const support = await checkSupport();
      if (!support.supported) {
        throw new Error(`Stockage HDS non supporté: ${support.details.join(', ')}`);
      }
      
      // Configurer le gestionnaire HDS
      await hdsSecureManager.configure({
        directoryHandle: config.directoryHandle,
        password: config.password,
        entities: config.entities || ['patients', 'appointments', 'invoices']
      });
      
      console.log('✅ Configuration HDS sécurisé terminée avec succès');
      toast.success('Stockage HDS sécurisé configuré avec succès !');
      
      setState(prev => ({ ...prev, isConfiguring: false }));
      
    } catch (error) {
      console.error('❌ Erreur configuration HDS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de configuration';
      
      setState(prev => ({
        ...prev,
        isConfiguring: false,
        error: errorMessage
      }));
      
      toast.error(`Erreur configuration HDS: ${errorMessage}`);
      throw error;
    }
  }, [ensureConnectedMode, checkSupport]);

  const reset = useCallback(async () => {
    try {
      await ensureConnectedMode();
      
      console.log('🗑️ Réinitialisation du stockage HDS...');
      await hdsSecureManager.reset();
      
      setState(prev => ({ ...prev, error: null }));
      toast.success('Stockage HDS réinitialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur réinitialisation HDS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de réinitialisation';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(`Erreur réinitialisation: ${errorMessage}`);
      throw error;
    }
  }, [ensureConnectedMode]);

  const verifyIntegrity = useCallback(async () => {
    try {
      await ensureConnectedMode();
      
      console.log('🔍 Vérification intégrité HDS...');
      const result = await hdsSecureManager.verifyAllIntegrity();
      
      if (result.overallValid) {
        toast.success('Intégrité des données HDS validée');
      } else {
        toast.warning('Problèmes d\'intégrité détectés dans les données HDS');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur vérification intégrité:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de vérification';
      toast.error(`Erreur vérification intégrité: ${errorMessage}`);
      throw error;
    }
  }, [ensureConnectedMode]);

  return {
    ...state,
    checkSupport,
    configure,
    reset,
    verifyIntegrity
  };
};