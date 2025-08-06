import { useQuery } from '@tanstack/react-query';
import { Patient } from '@/types';
import { api } from '@/services/api';
import { useMemo } from 'react';
// Service demo supprimé

// Hook optimisé pour la gestion des patients avec cache intelligent
export const useOptimizedPatients = (
  searchQuery: string = '',
  selectedCabinetId: number | null = null,
  sortBy: 'name' | 'date' | 'email' | 'gender' = 'name',
  currentPage: number = 1,
  patientsPerPage: number = 25
) => {
  // Mode démo supprimé
  
  // Query principale avec cache
  const {
    data: allPatients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.getPatients(),
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

  return {
    ...paginatedData,
    allPatients: processedPatients,
    isLoading,
    error,
    refetch,
  };
};