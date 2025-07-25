import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentStatus } from '@/types';
import { hybridAppointmentService } from '@/services/hybrid-appointment-service';
import { useDemo } from '@/contexts/DemoContext';
import { toast } from 'sonner';

/**
 * Hook optimisé pour la gestion des rendez-vous avec architecture hybride
 * Remplace progressivement les hooks d'appointments existants
 */
export const useHybridAppointments = () => {
  const { isDemoMode } = useDemo();
  const queryClient = useQueryClient();
  
  // Query principale pour tous les rendez-vous
  const {
    data: appointments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hybrid-appointments', isDemoMode],
    queryFn: async () => {
      console.log('🔄 useHybridAppointments: Fetching appointments via hybrid architecture');
      
      // En mode démo, retourner un tableau vide pour l'instant
      // Les données démo sont gérées par le contexte DemoContext
      if (isDemoMode) {
        console.log('Mode démo activé - utilisation des données du contexte');
        return [];
      }
      
      // Sinon utiliser l'architecture hybride
      return await hybridAppointmentService.getAppointments();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (plus court pour les RDV)
    gcTime: 1000 * 60 * 15, // 15 minutes de cache
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Hook pour récupérer un rendez-vous par ID
  const useAppointmentById = (id: number) => {
    return useQuery({
      queryKey: ['hybrid-appointment', id, isDemoMode],
      queryFn: async () => {
        if (isDemoMode) {
          console.log('Mode démo - getById retourne null');
          return null;
        }
        return await hybridAppointmentService.getAppointmentById(id);
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Hook pour récupérer les rendez-vous d'un patient
  const useAppointmentsByPatient = (patientId: number) => {
    return useQuery({
      queryKey: ['hybrid-appointments-by-patient', patientId, isDemoMode],
      queryFn: async () => {
        if (isDemoMode) {
          console.log('Mode démo - retourne tableau vide pour patient');
          return [];
        }
        return await hybridAppointmentService.getAppointmentsByPatientId(patientId);
      },
      enabled: !!patientId,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Mutation pour créer/modifier un rendez-vous
  const appointmentMutation = useMutation({
    mutationFn: async (data: { appointment: any, isCreate: boolean }) => {
      console.log('🔄 useHybridAppointments: Mutating appointment via hybrid architecture');
      
      if (isDemoMode) {
        // En mode démo, retourner les données telles quelles
        return { ...data.appointment, id: Date.now() } as Appointment;
      }

      if (data.isCreate) {
        return await hybridAppointmentService.createAppointment(data.appointment);
      } else {
        const { id, ...updateData } = data.appointment;
        return await hybridAppointmentService.updateAppointment(id, updateData);
      }
    },
    onSuccess: (updatedAppointment, variables) => {
      // Invalider les caches liés aux rendez-vous
      queryClient.invalidateQueries({ queryKey: ['hybrid-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-appointment'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-appointments-by-patient'] });
      
      const action = variables.isCreate ? 'créé' : 'mis à jour';
      toast.success(`Rendez-vous ${action} avec succès`);
    },
    onError: (error) => {
      console.error('Error in appointment mutation:', error);
      toast.error('Erreur lors de la sauvegarde du rendez-vous');
    },
  });

  // Mutation pour changer le statut d'un rendez-vous
  const statusMutation = useMutation({
    mutationFn: async (data: { id: number, status: AppointmentStatus }) => {
      if (isDemoMode) {
        return { id: data.id, status: data.status } as Appointment;
      }
      return await hybridAppointmentService.updateAppointmentStatus(data.id, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybrid-appointments'] });
      toast.success('Statut du rendez-vous mis à jour');
    },
    onError: (error) => {
      console.error('Error updating appointment status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  // Mutation pour supprimer un rendez-vous
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      if (isDemoMode) {
        return true;
      }
      return await hybridAppointmentService.deleteAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybrid-appointments'] });
      toast.success('Rendez-vous supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      toast.error('Erreur lors de la suppression du rendez-vous');
    },
  });

  return {
    // Données
    appointments,
    isLoading,
    error,
    refetch,
    
    // Hooks spécialisés
    useAppointmentById,
    useAppointmentsByPatient,
    
    // Actions
    createAppointment: (appointment: any) => 
      appointmentMutation.mutate({ appointment, isCreate: true }),
    updateAppointment: (appointment: any) => 
      appointmentMutation.mutate({ appointment, isCreate: false }),
    updateAppointmentStatus: (id: number, status: AppointmentStatus) =>
      statusMutation.mutate({ id, status }),
    cancelAppointment: (id: number) =>
      statusMutation.mutate({ id, status: 'CANCELED' }),
    deleteAppointment: (appointmentId: number) => 
      deleteAppointmentMutation.mutate(appointmentId),
    
    // États des mutations
    isCreating: appointmentMutation.isPending,
    isUpdatingStatus: statusMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending,
  };
};