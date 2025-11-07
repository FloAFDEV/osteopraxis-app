import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { useAppPerformance } from './useAppPerformance';
import { Appointment, AppointmentStatus } from '@/types';
import { toast } from 'sonner';

/**
 * Hook optimisé pour les rendez-vous avec mise à jour temps réel
 * et performances améliorées selon Lighthouse
 */
export function useOptimizedAppointments() {
  const { user, isAuthenticated } = useAuth();
  const { isDemoMode } = useDemo();
  const queryClient = useQueryClient();
  const { metrics, optimizations } = useAppPerformance();

  // Configuration de cache adaptative basée sur les performances
  const getCacheConfig = () => {
    if (optimizations.enableVirtualization || metrics.isLowEndDevice) {
      return {
        staleTime: 30 * 1000, // 30 secondes pour appareils lents
        gcTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
      };
    }
    
    return {
      staleTime: 10 * 1000, // 10 secondes pour temps réel
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    };
  };

  const cacheConfig = getCacheConfig();

  // Query pour les rendez-vous avec configuration optimisée
  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments', user?.osteopathId, `mode:${isDemoMode ? 'DEMO' : 'CONNECTED'}`, 'optimized'],
    queryFn: async () => {
      if (isDemoMode) {
        return await api.getAppointments();
      }
      if (!user?.osteopathId) return [];
      return await api.getAppointments();
    },
    enabled: isDemoMode || (!!user?.osteopathId && isAuthenticated),
    ...cacheConfig,
    retry: (failureCount, error) => {
      // Ne pas retenter pour les erreurs PIN
      if (error instanceof Error && (
        error.message === 'PIN_SETUP_REQUIRED' || 
        error.message === 'PIN_UNLOCK_REQUIRED'
      )) {
        return false;
      }
      return failureCount < (metrics.isLowEndDevice ? 1 : 3);
    },
  });

  // Query pour les patients avec cache plus long
  const {
    data: patients = [],
    isLoading: patientsLoading,
    error: patientsError,
  } = useQuery({
    queryKey: ['patients', user?.osteopathId, `mode:${isDemoMode ? 'DEMO' : 'CONNECTED'}`, 'optimized'],
    queryFn: async () => {
      if (isDemoMode) {
        return await api.getPatients();
      }
      if (!user?.osteopathId) return [];
      return await api.getPatients();
    },
    enabled: isDemoMode || (!!user?.osteopathId && isAuthenticated),
    staleTime: 5 * 60 * 1000, // 5 minutes pour les patients
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Ne pas retenter pour les erreurs PIN
      if (error instanceof Error && (
        error.message === 'PIN_SETUP_REQUIRED' || 
        error.message === 'PIN_UNLOCK_REQUIRED'
      )) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mise à jour optimiste des statuts avec invalidation globale
  const updateAppointmentStatusOptimistically = async (
    appointmentId: number,
    newStatus: AppointmentStatus
  ) => {
    try {
      // Mise à jour optimiste immédiate
      queryClient.setQueryData(
      ['appointments', user?.osteopathId, `mode:${isDemoMode ? 'DEMO' : 'CONNECTED'}`, 'optimized'],
        (oldAppointments: Appointment[] = []) =>
          oldAppointments.map(apt =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
      );

      // Appel API
      await api.updateAppointmentStatus(appointmentId, newStatus);

      // Invalider toutes les queries liées pour synchroniser
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['appointments']
        }),
        queryClient.invalidateQueries({
          queryKey: ['appointments', 'patient']
        })
      ]);

      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      // Revert en cas d'erreur
      await refetchAppointments();
      toast.error('Erreur lors de la mise à jour du statut');
      throw error;
    }
  };

  // Ajout optimiste d'un nouveau rendez-vous
  const addAppointmentOptimistically = (newAppointment: Appointment) => {
    // Mise à jour immédiate de la liste des rendez-vous
    queryClient.setQueryData(
      ['appointments', user?.osteopathId, `mode:${isDemoMode ? 'DEMO' : 'CONNECTED'}`, 'optimized'],
      (oldAppointments: Appointment[] = []) => [...oldAppointments, newAppointment]
    );

    // Invalider aussi les queries patient-spécifiques avec mode
    queryClient.invalidateQueries({
      queryKey: ['appointments', 'patient']
    });

    // Invalider toutes les queries d'appointments pour synchronisation complète
    queryClient.invalidateQueries({
      queryKey: ['appointments']
    });

    toast.success('Séance ajoutée avec succès');
  };

  // Nettoyage automatique du cache sur appareils low-end
  useEffect(() => {
    if (metrics.isLowEndDevice) {
      const cleanup = setInterval(() => {
        queryClient.clear();
      }, 10 * 60 * 1000); // Nettoyage toutes les 10 minutes

      return () => clearInterval(cleanup);
    }
  }, [metrics.isLowEndDevice, queryClient]);

  return {
    appointments,
    patients,
    isLoading: appointmentsLoading || patientsLoading,
    error: appointmentsError || patientsError,
    updateAppointmentStatusOptimistically,
    addAppointmentOptimistically,
    refetchAppointments,
    metrics,
    optimizations
  };
}