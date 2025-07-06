import { useCallback, useMemo, useState, useEffect } from 'react';
import { useOptimizedCache } from './useOptimizedCache';
import { api } from '@/services/api';
import { Patient, Appointment, Cabinet } from '@/types';

/**
 * Hook global pour optimiser les performances de l'application
 * - Cache intelligent pour toutes les données
 * - Invalidation sélective du cache
 * - Préchargement des données critiques
 */
export const useGlobalOptimization = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Cache pour les données principales
  const {
    data: patients,
    loading: patientsLoading,
    invalidate: invalidatePatients
  } = useOptimizedCache(
    'global-patients',
    () => api.getPatients(),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );

  const {
    data: appointments,
    loading: appointmentsLoading,
    invalidate: invalidateAppointments
  } = useOptimizedCache(
    'global-appointments',
    () => api.getAppointments(),
    { ttl: 2 * 60 * 1000 } // 2 minutes
  );

  const {
    data: cabinets,
    loading: cabinetsLoading,
    invalidate: invalidateCabinets
  } = useOptimizedCache(
    'global-cabinets',
    () => api.getCabinets(),
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );

  // Initialisation complète
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Méthodes d'invalidation intelligente
  const invalidateAll = useCallback(() => {
    invalidatePatients();
    invalidateAppointments();
    invalidateCabinets();
  }, [invalidatePatients, invalidateAppointments, invalidateCabinets]);

  const invalidateRelated = useCallback((type: 'patient' | 'appointment' | 'cabinet') => {
    switch (type) {
      case 'patient':
        invalidatePatients();
        invalidateAppointments(); // Les appointments sont liés aux patients
        break;
      case 'appointment':
        invalidateAppointments();
        break;
      case 'cabinet':
        invalidateCabinets();
        invalidatePatients(); // Les patients peuvent être liés aux cabinets
        break;
    }
  }, [invalidatePatients, invalidateAppointments, invalidateCabinets]);

  // Préchargement intelligent
  const preloadData = useCallback(async () => {
    // Précharge les données les plus utilisées en arrière-plan
    try {
      await Promise.allSettled([
        api.getPatients(),
        api.getAppointments(),
        api.getCabinets()
      ]);
    } catch (error) {
      console.warn('Erreur lors du préchargement:', error);
    }
  }, []);

  // Stats de performance
  const performanceStats = useMemo(() => ({
    totalLoading: patientsLoading || appointmentsLoading || cabinetsLoading,
    cacheHitRate: patients && appointments && cabinets ? 1 : 0,
    dataFreshness: {
      patients: patients ? 'fresh' : 'loading',
      appointments: appointments ? 'fresh' : 'loading',
      cabinets: cabinets ? 'fresh' : 'loading'
    }
  }), [
    patientsLoading, appointmentsLoading, cabinetsLoading,
    patients, appointments, cabinets
  ]);

  return {
    // Données optimisées
    data: {
      patients: patients || [],
      appointments: appointments || [],
      cabinets: cabinets || []
    },
    
    // États de chargement
    loading: {
      patients: patientsLoading,
      appointments: appointmentsLoading,
      cabinets: cabinetsLoading,
      any: patientsLoading || appointmentsLoading || cabinetsLoading,
      initializing: isInitializing
    },

    // Méthodes d'optimisation
    optimize: {
      invalidateAll,
      invalidateRelated,
      preloadData
    },

    // Statistiques
    stats: performanceStats
  };
};

export default useGlobalOptimization;