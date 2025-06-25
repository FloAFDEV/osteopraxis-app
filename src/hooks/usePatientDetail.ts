
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Appointment, AppointmentStatus, Patient, Invoice } from '@/types';
import { invoiceService } from '@/services/api/invoice-service';

export function usePatientDetail(patientId: number) {
  const queryClient = useQueryClient();

  // Patient data with longer stale time since it changes less frequently
  const { 
    data: patient, 
    isLoading: patientLoading, 
    error: patientError 
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.getPatientById(patientId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Appointments with moderate stale time
  const { 
    data: appointments = [], 
    isLoading: appointmentsLoading 
  } = useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: () => api.getAppointmentsByPatientId(patientId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!patient,
  });

  // Invoices with longer stale time
  const { 
    data: invoices = [], 
    isLoading: invoicesLoading 
  } = useQuery({
    queryKey: ['invoices', 'patient', patientId],
    queryFn: () => invoiceService.getInvoicesByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!patient,
  });

  // Optimistic update for appointment status
  const updateAppointmentStatusOptimistically = async (
    appointmentId: number, 
    newStatus: AppointmentStatus
  ) => {
    // Immediately update the UI
    queryClient.setQueryData(
      ['appointments', 'patient', patientId],
      (oldAppointments: Appointment[] = []) =>
        oldAppointments.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
    );

    try {
      // Make the actual API call
      await api.updateAppointment(appointmentId, { status: newStatus });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'patient', patientId]
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'patient', patientId]
      });
      throw error;
    }
  };

  // Optimistic update for new appointments
  const addAppointmentOptimistically = (newAppointment: Appointment) => {
    queryClient.setQueryData(
      ['appointments', 'patient', patientId],
      (oldAppointments: Appointment[] = []) => [...oldAppointments, newAppointment]
    );
    
    // Invalidate to get the real data from server
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'patient', patientId]
      });
    }, 100);
  };

  return {
    patient,
    appointments,
    invoices,
    isLoading: patientLoading || appointmentsLoading || invoicesLoading,
    error: patientError,
    updateAppointmentStatusOptimistically,
    addAppointmentOptimistically,
  };
}
