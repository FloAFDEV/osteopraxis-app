import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient } from '@/types';
import { hybridPatientService } from '@/services/hybrid-patient-service';
import { supabasePatientService } from '@/services/supabase-api/patient-service';
import { toast } from 'sonner';

interface HybridPatientState {
  isHybridMode: boolean;
  isHybridAvailable: boolean;
  storageStats: {
    totalPatients: number;
    localPatients: number;
    cloudPatients: number;
    storageMode: 'hybrid' | 'cloud' | 'local';
  } | null;
}

/**
 * Hook pour la gestion hybride des patients
 * Gère automatiquement le basculement entre cloud et local
 */
export const useHybridPatients = () => {
  const queryClient = useQueryClient();
  const [hybridState, setHybridState] = useState<HybridPatientState>({
    isHybridMode: false,
    isHybridAvailable: false,
    storageStats: null
  });

  // Vérifier la disponibilité du mode hybride au montage
  useEffect(() => {
    checkHybridAvailability();
  }, []);

  const checkHybridAvailability = async () => {
    try {
      const isAvailable = await hybridPatientService.isHybridAvailable();
      setHybridState(prev => ({ ...prev, isHybridAvailable: isAvailable }));
    } catch (error) {
      console.warn('Erreur lors de la vérification du mode hybride:', error);
    }
  };

  // Activer/désactiver le mode hybride
  const toggleHybridMode = useCallback(async (enabled: boolean) => {
    try {
      await hybridPatientService.toggleHybridMode(enabled);
      setHybridState(prev => ({ ...prev, isHybridMode: enabled }));
      
      // Invalider les requêtes pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      
      if (enabled) {
        toast.success('Mode hybride activé - Les données sont maintenant stockées localement');
      } else {
        toast.success('Mode cloud activé - Les données sont stockées sur Supabase');
      }
    } catch (error) {
      console.error('Erreur lors du basculement de mode:', error);
      toast.error('Erreur lors du changement de mode de stockage');
    }
  }, [queryClient]);

  // Charger les statistiques de stockage
  const loadStorageStats = useCallback(async () => {
    try {
      const stats = await hybridPatientService.getStorageStats();
      setHybridState(prev => ({ ...prev, storageStats: stats }));
      return stats;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      return null;
    }
  }, []);

  // Query pour récupérer les patients (avec basculement automatique)
  const patientsQuery = useQuery({
    queryKey: ['patients', hybridState.isHybridMode ? 'hybrid' : 'cloud'],
    queryFn: async () => {
      if (hybridState.isHybridMode && hybridState.isHybridAvailable) {
        return await hybridPatientService.getPatients();
      }
      return await supabasePatientService.getPatients();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Retry avec fallback automatique
      if (failureCount < 2 && hybridState.isHybridMode) {
        console.warn('Tentative de fallback vers le cloud...', error);
        return true;
      }
      return false;
    }
  });

  // Mutation pour créer un patient
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (hybridState.isHybridMode && hybridState.isHybridAvailable) {
        return await hybridPatientService.createPatient(patientData);
      }
      return await supabasePatientService.createPatient(patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      loadStorageStats(); // Mettre à jour les statistiques
      toast.success('Patient créé avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la création du patient:', error);
      toast.error('Erreur lors de la création du patient');
    }
  });

  // Mutation pour mettre à jour un patient
  const updatePatientMutation = useMutation({
    mutationFn: async (patient: Patient) => {
      if (hybridState.isHybridMode && hybridState.isHybridAvailable) {
        return await hybridPatientService.updatePatient(patient);
      }
      return await supabasePatientService.updatePatient(patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du patient:', error);
      toast.error('Erreur lors de la mise à jour du patient');
    }
  });

  // Mutation pour supprimer un patient
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      if (hybridState.isHybridMode && hybridState.isHybridAvailable) {
        return await hybridPatientService.deletePatient(patientId);
      }
      return await supabasePatientService.deletePatient(patientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      loadStorageStats(); // Mettre à jour les statistiques
      toast.success('Patient supprimé avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du patient:', error);
      toast.error('Erreur lors de la suppression du patient');
    }
  });

  // Fonction pour récupérer un patient par ID
  const getPatientById = useCallback(async (id: number): Promise<Patient | null> => {
    try {
      if (hybridState.isHybridMode && hybridState.isHybridAvailable) {
        return await hybridPatientService.getPatientById(id);
      }
      return await supabasePatientService.getPatientById(id);
    } catch (error) {
      console.error('Erreur lors de la récupération du patient:', error);
      return null;
    }
  }, [hybridState.isHybridMode, hybridState.isHybridAvailable]);

  // Migration des données cloud vers local
  const migratePatientsToLocal = useCallback(async () => {
    if (!hybridState.isHybridAvailable) {
      throw new Error('Le stockage local n\'est pas disponible');
    }

    try {
      await hybridPatientService.enableHybridMode();
      const result = await hybridPatientService.migrateFromCloud();
      
      // Mettre à jour l'état et invalider les requêtes
      setHybridState(prev => ({ ...prev, isHybridMode: true }));
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      await loadStorageStats();
      
      toast.success(`Migration terminée : ${result.migrated} patients migrés`);
      
      if (result.errors.length > 0) {
        console.warn('Erreurs de migration:', result.errors);
        toast.warning(`${result.errors.length} erreurs lors de la migration`);
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      toast.error('Erreur lors de la migration des patients');
      throw error;
    }
  }, [hybridState.isHybridAvailable, queryClient, loadStorageStats]);

  return {
    // État
    patients: patientsQuery.data || [],
    isLoading: patientsQuery.isLoading,
    error: patientsQuery.error,
    hybridState,

    // Actions de base
    createPatient: createPatientMutation.mutateAsync,
    updatePatient: updatePatientMutation.mutateAsync,
    deletePatient: deletePatientMutation.mutateAsync,
    getPatientById,

    // Actions hybrides
    toggleHybridMode,
    migratePatientsToLocal,
    loadStorageStats,
    checkHybridAvailability,

    // État des mutations
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,

    // Fonction de rafraîchissement
    refetch: patientsQuery.refetch
  };
};

export default useHybridPatients;