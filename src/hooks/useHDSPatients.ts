/**
 * Hook pour la gestion des patients HDS - Stockage local exclusif
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { Patient } from '@/types';
import { hdsLocalDataService } from '@/services/hds-data-adapter/local-service';
import { HDSLocalStatus } from '@/services/hds-data-adapter/types';
import { toast } from 'sonner';

interface HDSPatientsState {
  localStatus: HDSLocalStatus | null;
  isLocalAvailable: boolean;
}

export function useHDSPatients() {
  const queryClient = useQueryClient();
  const [hdsState, setHdsState] = useState<HDSPatientsState>({
    localStatus: null,
    isLocalAvailable: false
  });

  // Vérifier la disponibilité du stockage local au chargement
  useEffect(() => {
    checkLocalAvailability();
  }, []);

  const checkLocalAvailability = useCallback(async () => {
    try {
      const status = await hdsLocalDataService.getStatus();
      setHdsState({
        localStatus: status,
        isLocalAvailable: status.available
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du stockage local:', error);
      setHdsState({
        localStatus: null,
        isLocalAvailable: false
      });
    }
  }, []);

  // Query pour récupérer les patients - TOUJOURS depuis le stockage local
  const { 
    data: patients = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['hds-patients'],
    queryFn: async () => {
      if (!hdsState.isLocalAvailable) {
        throw new Error('Stockage local non disponible - Impossible de récupérer les patients');
      }
      return await hdsLocalDataService.patients.getAll();
    },
    enabled: hdsState.isLocalAvailable,
    retry: (failureCount, error) => {
      console.error('Erreur lors de la récupération des patients:', error);
      return failureCount < 2; // Réessayer 2 fois maximum
    }
  });

  // Mutation pour créer un patient
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!hdsState.isLocalAvailable) {
        throw new Error('Stockage local non disponible');
      }
      await hdsLocalDataService.validateDataSafety('patients', 'create');
      return await hdsLocalDataService.patients.create(patientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hds-patients'] });
      loadLocalStatus();
      toast.success('Patient créé avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la création du patient:', error);
      toast.error('Impossible de créer le patient');
    }
  });

  // Mutation pour mettre à jour un patient
  const updatePatientMutation = useMutation({
    mutationFn: async (patient: Patient) => {
      if (!hdsState.isLocalAvailable) {
        throw new Error('Stockage local non disponible');
      }
      await hdsLocalDataService.validateDataSafety('patients', 'update');
      return await hdsLocalDataService.patients.update(patient.id, patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hds-patients'] });
      loadLocalStatus();
      toast.success('Patient mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du patient:', error);
      toast.error('Impossible de mettre à jour le patient');
    }
  });

  // Mutation pour supprimer un patient
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      if (!hdsState.isLocalAvailable) {
        throw new Error('Stockage local non disponible');
      }
      await hdsLocalDataService.validateDataSafety('patients', 'delete');
      const success = await hdsLocalDataService.patients.delete(patientId);
      if (!success) {
        throw new Error('Échec de la suppression');
      }
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hds-patients'] });
      loadLocalStatus();
      toast.success('Patient supprimé avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du patient:', error);
      toast.error('Impossible de supprimer le patient');
    }
  });

  // Fonction pour récupérer un patient par ID
  const getPatientById = useCallback(async (id: number): Promise<Patient | null> => {
    if (!hdsState.isLocalAvailable) {
      console.warn('Stockage local non disponible pour récupérer le patient');
      return null;
    }
    
    try {
      return await hdsLocalDataService.patients.getById(id);
    } catch (error) {
      console.error('Erreur lors de la récupération du patient:', error);
      return null;
    }
  }, [hdsState.isLocalAvailable]);

  // Charger le statut local
  const loadLocalStatus = useCallback(async () => {
    try {
      const status = await hdsLocalDataService.getStatus();
      setHdsState(prev => ({
        ...prev,
        localStatus: status,
        isLocalAvailable: status.available
      }));
    } catch (error) {
      console.error('Erreur lors du chargement du statut local:', error);
    }
  }, []);

  // Initialiser le stockage local si nécessaire
  const initializeLocalStorage = useCallback(async () => {
    try {
      await hdsLocalDataService.initialize();
      await checkLocalAvailability();
      await loadLocalStatus();
      toast.success('Stockage local initialisé');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du stockage local:', error);
      toast.error('Impossible d\'initialiser le stockage local');
    }
  }, [checkLocalAvailability, loadLocalStatus]);

  return {
    // Données
    patients,
    isLoading,
    error,
    hdsState,

    // Actions sur les patients
    createPatient: createPatientMutation.mutateAsync,
    updatePatient: updatePatientMutation.mutateAsync,
    deletePatient: deletePatientMutation.mutateAsync,
    getPatientById,

    // États des mutations
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,

    // Actions utilitaires
    refetch,
    checkLocalAvailability,
    loadLocalStatus,
    initializeLocalStorage
  };
}