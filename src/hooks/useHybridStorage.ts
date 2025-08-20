import { useState, useEffect, useCallback } from 'react';
import { hybridStorageManager, type StorageStatus } from '@/services/hybrid-storage-manager';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérifier si c'est un utilisateur démo (même logique que AuthContext)
  const isDemoUser = user?.email === 'demo@patienthub.com' || 
                     user?.email?.startsWith('demo-') ||
                     (user as any)?.is_demo === true ||
                     (user as any)?.is_demo_user === true;

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
      
      // En mode démo uniquement, utiliser le cloud
      if (isDemoUser) {
        console.log('🎭 Utilisateur démo détecté - Stockage cloud');
        setStatus({
          isConfigured: true,
          isUnlocked: true,
          localAvailable: false,
          cloudAvailable: true,
          dataClassification: {
            local: [],
            cloud: ['appointments', 'patients', 'invoices']
          }
        });
        setIsLoading(false);
        return;
      }
      
      console.log('🔧 Utilisateur réel - Initialisation stockage hybride OBLIGATOIRE...');
      
      // FORCER l'initialisation OPFS AVANT tout le reste
      console.log('🚨 ÉTAPE CRITIQUE: Test d\'initialisation OPFS SQLite...');
      try {
        const { getOPFSSQLiteService, checkOPFSSupport } = await import('@/services/sqlite/opfs-sqlite-service');
        
        // Vérifier support OPFS en premier
        const opfsSupport = checkOPFSSupport();
        console.log('🔍 Support OPFS détecté:', opfsSupport);
        
        if (!opfsSupport.supported) {
          throw new Error(`OPFS non supporté: ${opfsSupport.details.join(', ')}`);
        }
        
        // Forcer l'initialisation du service SQLite
        console.log('⚡ Initialisation forcée du service SQLite OPFS...');
        const sqliteService = await getOPFSSQLiteService();
        
        // Test de validation que SQLite fonctionne
        console.log('🧪 Test de validation SQLite...');
        await sqliteService.run('CREATE TABLE IF NOT EXISTS validation_test (id INTEGER PRIMARY KEY, data TEXT)');
        await sqliteService.run('INSERT INTO validation_test (data) VALUES (?)', ['test_hds_compliance']);
        const testResult = await sqliteService.query('SELECT * FROM validation_test WHERE data = ?', ['test_hds_compliance']);
        await sqliteService.run('DROP TABLE IF EXISTS validation_test');
        
        if (!testResult || testResult.length === 0) {
          throw new Error('Test de validation SQLite OPFS échoué');
        }
        
        console.log('✅ SUCCÈS: SQLite OPFS opérationnel et testé');
        
      } catch (opfsError) {
        console.error('❌ ÉCHEC CRITIQUE OPFS:', opfsError);
        throw new Error(`❌ CONFORMITÉ HDS IMPOSSIBLE: ${opfsError instanceof Error ? opfsError.message : 'Erreur OPFS inconnue'}`);
      }
      
      // Maintenant initialiser le gestionnaire hybride
      await hybridStorageManager.initialize();
      const storageStatus = await loadStatus();
      console.log('📊 Statut stockage après initialisation:', storageStatus);
      
      // Validation finale: le stockage local DOIT être disponible
      if (!storageStatus?.localAvailable) {
        throw new Error('❌ CONFORMITÉ HDS: Le stockage local sécurisé n\'est pas disponible');
      }
      
      console.log('🎉 INITIALISATION RÉUSSIE: Stockage hybride HDS opérationnel');
      
    } catch (error) {
      console.error('❌ ÉCHEC INITIALISATION HYBRIDE:', error);
      toast.error('❌ ERREUR CRITIQUE: Impossible d\'initialiser le stockage sécurisé HDS');
      
      // En cas d'échec, mettre un statut d'erreur
      setStatus({
        isConfigured: false,
        isUnlocked: false,
        localAvailable: false,
        cloudAvailable: false,
        dataClassification: {
          local: ['patients', 'appointments', 'invoices'],
          cloud: []
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadStatus, isDemoUser]);

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
    isSetupRequired: isDemoUser ? false : (status ? !status.isConfigured : true),
    isUnlocked: isDemoUser ? true : hybridStorageManager.isStorageUnlocked(),
    initialize,
    unlock,
    lock,
    refresh
  };
};