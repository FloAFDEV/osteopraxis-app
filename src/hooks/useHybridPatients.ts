import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient } from '@/types';
import { hybridPatientService } from '@/services/hybrid-patient-service';
import { useMemo } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { toast } from 'sonner';

/**
 * Hook optimisé pour la gestion des patients avec architecture hybride
 * Remplace progressivement useOptimizedPatients
 */
export const useHybridPatients = (
  searchQuery: string = '',
  selectedCabinetId: number | null = null,
  sortBy: 'name' | 'date' | 'email' | 'gender' = 'name',
  currentPage: number = 1,
  patientsPerPage: number = 25
) => {
  const { isDemoMode } = useDemo();
  const queryClient = useQueryClient();
  
  // Query principale avec cache
  const {
    data: allPatients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hybrid-patients', isDemoMode],
    queryFn: async () => {
      console.log('🔄 useHybridPatients: Fetching patients via hybrid architecture');
      
      // En mode démo, retourner un tableau vide pour l'instant
      // Les données démo sont gérées par le contexte DemoContext
      if (isDemoMode) {
        console.log('Mode démo activé - utilisation des données du contexte');
        return [];
      }
      
      // Sinon utiliser l'architecture hybride
      return await hybridPatientService.getPatients();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes de cache
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Filtrage et tri mémorisés pour éviter les recalculs
  const processedPatients = useMemo(() => {
    let filtered = allPatients;

    // Filtre par cabinet
    if (selectedCabinetId) {
      filtered = filtered.filter(patient => patient.cabinetId === selectedCabinetId);
    }

    // Filtre par recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => {
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
          (patient.phone && patient.phone.includes(searchLower)) ||
          (patient.occupation && patient.occupation.toLowerCase().includes(searchLower))
        );
      });
    }

    // Tri
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.lastName || '').localeCompare(b.lastName || '');
        case 'date':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'gender':
          return (a.gender || '').localeCompare(b.gender || '');
        default:
          return (a.lastName || '').localeCompare(b.lastName || '');
      }
    });

    return sorted;
  }, [allPatients, selectedCabinetId, searchQuery, sortBy]);

  // Pagination mémorisée
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(processedPatients.length / patientsPerPage);
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = startIndex + patientsPerPage;
    
    return {
      patients: processedPatients.slice(startIndex, endIndex),
      totalPatients: processedPatients.length,
      totalPages,
      hasMore: endIndex < processedPatients.length,
      hasPrevious: currentPage > 1,
    };
  }, [processedPatients, currentPage, patientsPerPage]);

  // Mutation pour créer/modifier un patient
  const patientMutation = useMutation({
    mutationFn: async (data: { patient: Patient | Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>, isCreate: boolean }) => {
      console.log('🔄 useHybridPatients: Mutating patient via hybrid architecture');
      
      if (isDemoMode) {
        // En mode démo, pas de vraie mutation
        return data.patient as Patient;
      }

      if (data.isCreate) {
        return await hybridPatientService.createPatient(data.patient as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
      } else {
        return await hybridPatientService.updatePatient(data.patient as Patient);
      }
    },
    onSuccess: (updatedPatient, variables) => {
      // Invalider et refetch les données
      queryClient.invalidateQueries({ queryKey: ['hybrid-patients'] });
      
      const action = variables.isCreate ? 'créé' : 'mis à jour';
      toast.success(`Patient ${action} avec succès`);
    },
    onError: (error) => {
      console.error('Error in patient mutation:', error);
      toast.error('Erreur lors de la sauvegarde du patient');
    },
  });

  // Mutation pour supprimer un patient
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      if (isDemoMode) {
        // En mode démo, pas de vraie suppression
        return true;
      }
      return await hybridPatientService.deletePatient(patientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybrid-patients'] });
      toast.success('Patient supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
      toast.error('Erreur lors de la suppression du patient');
    },
  });

  return {
    ...paginatedData,
    allPatients: processedPatients,
    isLoading,
    error,
    refetch,
    // Mutations
    createPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => 
      patientMutation.mutate({ patient, isCreate: true }),
    updatePatient: (patient: Patient) => 
      patientMutation.mutate({ patient, isCreate: false }),
    deletePatient: (patientId: number) => 
      deletePatientMutation.mutate(patientId),
    // États des mutations
    isCreating: patientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,
  };
};