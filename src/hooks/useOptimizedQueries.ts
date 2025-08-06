import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Patient, Appointment, Cabinet, Invoice } from '@/types';
import { useOptimization } from '@/contexts/OptimizationContext';

/**
 * Hook d'optimisation des requêtes avec cache intelligent
 */

// Configuration des clés de cache
export const QUERY_KEYS = {
  patients: ['patients'] as const,
  patient: (id: number) => ['patients', id] as const,
  appointments: ['appointments'] as const,
  appointment: (id: number) => ['appointments', id] as const,
  cabinets: ['cabinets'] as const,
  cabinet: (id: number) => ['cabinets', id] as const,
  invoices: ['invoices'] as const,
  invoice: (id: number) => ['invoices', id] as const,
  osteopaths: ['osteopaths'] as const,
};

// Configuration du cache avec stale time optimisé
const CACHE_CONFIG = {
  patients: { staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 }, // 5min stale, 30min cache
  appointments: { staleTime: 2 * 60 * 1000, cacheTime: 15 * 60 * 1000 }, // 2min stale, 15min cache
  cabinets: { staleTime: 10 * 60 * 1000, cacheTime: 60 * 60 * 1000 }, // 10min stale, 1h cache
  invoices: { staleTime: 3 * 60 * 1000, cacheTime: 20 * 60 * 1000 }, // 3min stale, 20min cache
};

export const useOptimizedPatients = () => {
  return useQuery({
    queryKey: QUERY_KEYS.patients,
    queryFn: () => api.getPatients(),
    ...CACHE_CONFIG.patients,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useOptimizedPatient = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.patient(id),
    queryFn: () => api.getPatientById(id),
    ...CACHE_CONFIG.patients,
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export const useOptimizedAppointments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.appointments,
    queryFn: () => api.getAppointments(),
    ...CACHE_CONFIG.appointments,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useOptimizedCabinets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.cabinets,
    queryFn: () => api.getCabinets(),
    ...CACHE_CONFIG.cabinets,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useOptimizedInvoices = () => {
  return useQuery({
    queryKey: QUERY_KEYS.invoices,
    queryFn: () => api.getInvoices(),
    ...CACHE_CONFIG.invoices,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Mutations optimistes avec invalidation intelligente
export const useOptimizedPatientMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Patient> & { id?: number }) => {
      if (data.id) {
        return await api.updatePatient(data as Patient);
      } else {
        return await api.createPatient(data as Omit<Patient, 'id'>);
      }
    },
    onMutate: async (newData) => {
      // Optimistic update
      if (newData.id) {
        await queryClient.cancelQueries({ queryKey: QUERY_KEYS.patient(newData.id) });
        const previousData = queryClient.getQueryData(QUERY_KEYS.patient(newData.id));
        if (previousData && typeof previousData === 'object') {
          queryClient.setQueryData(QUERY_KEYS.patient(newData.id), { ...previousData as object, ...newData });
        }
        return { previousData, patientId: newData.id };
      }
      return {};
    },
    onSuccess: (data, variables) => {
      // Invalidation intelligente
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(variables.id) });
      }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.patientId && context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.patient(context.patientId), context.previousData);
      }
    },
  });
};

export const useOptimizedAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Appointment> & { id?: number }) => {
      if (data.id) {
        return await api.updateAppointment(data.id, data);
      } else {
        return await api.createAppointment(data as Omit<Appointment, 'id'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
};

// Préchargement intelligent
export const usePreloadData = () => {
  const queryClient = useQueryClient();
  
  const preloadPatients = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.patients,
      queryFn: () => api.getPatients(),
      staleTime: CACHE_CONFIG.patients.staleTime,
    });
  };

  const preloadAppointments = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.appointments,
      queryFn: () => api.getAppointments(),
      staleTime: CACHE_CONFIG.appointments.staleTime,
    });
  };

  const preloadCabinets = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.cabinets,
      queryFn: () => api.getCabinets(),
      staleTime: CACHE_CONFIG.cabinets.staleTime,
    });
  };

  return {
    preloadPatients,
    preloadAppointments,
    preloadCabinets,
    preloadAll: () => {
      preloadPatients();
      preloadAppointments();
      preloadCabinets();
    },
  };
};