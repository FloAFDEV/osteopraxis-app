
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Appointment, AppointmentStatus, Patient, Invoice } from '@/types';
import { invoiceService } from '@/services/api/invoice-service';
import { PatientFormValues } from '@/components/patient-form/types';
import { useDemo } from '@/contexts/DemoContext';

export function usePatientDetail(patientId: number) {
  const queryClient = useQueryClient();
  const { isDemoMode } = useDemo();

  // Patient detail - logs sécurisés

  // Patient data with longer stale time since it changes less frequently
  const { 
    data: patient, 
    isLoading: patientLoading, 
    error: patientError 
  } = useQuery({
    queryKey: ['patient', patientId, isDemoMode],
    queryFn: async () => {
      const result = await api.getPatientById(patientId);
      if (!result) {
        throw new Error(`Patient ${patientId} non trouvé`);
      }
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    enabled: isDemoMode || (!!patientId && patientId > 0),
  });

  // Appointments with moderate stale time
  const { 
    data: appointments = [], 
    isLoading: appointmentsLoading,
    error: appointmentsError
  } = useQuery({
    queryKey: ['appointments', 'patient', patientId, isDemoMode],
    queryFn: async () => {
      console.log(`✅ Fetching appointments for patient ${patientId} in demo mode: ${isDemoMode}`);
      const result = await api.getAppointmentsByPatientId(patientId);
      console.log(`✅ Found ${result?.length || 0} appointments for patient ${patientId}:`, result);
      return result || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: isDemoMode || (!!patientId && patientId > 0),
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Invoices with longer stale time
  const { 
    data: invoices = [], 
    isLoading: invoicesLoading,
    error: invoicesError
  } = useQuery({
    queryKey: ['invoices', 'patient', patientId, isDemoMode],
    queryFn: async () => {
      // ✅ Factures patient récupérées
      const result = await invoiceService.getInvoicesByPatientId(patientId);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isDemoMode || !!patient,
    retry: 3,
  });

  // Log any errors
  if (patientError) {
    console.error(`usePatientDetail: Error loading patient ${patientId}:`, patientError);
  }
  if (appointmentsError) {
    console.error(`usePatientDetail: Error loading appointments for patient ${patientId}:`, appointmentsError);
  }
  if (invoicesError) {
    console.error(`usePatientDetail: Error loading invoices for patient ${patientId}:`, invoicesError);
  }

  // Optimistic update for appointment status
  const updateAppointmentStatusOptimistically = async (
    appointmentId: number, 
    newStatus: AppointmentStatus
  ) => {
    // ✅ Statut RDV mis à jour
    
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
      console.error(`usePatientDetail: Error updating appointment ${appointmentId}:`, error);
      // Revert on error
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'patient', patientId]
      });
      throw error;
    }
  };

  // Optimistic update for new appointments
  const addAppointmentOptimistically = (newAppointment: Appointment) => {
    // ✅ RDV ajouté
    queryClient.setQueryData(
      ['appointments', 'patient', patientId],
      (oldAppointments: Appointment[] = []) => [...oldAppointments, newAppointment]
    );
    
    // Invalidate immediately pour rafraîchir les onglets
    queryClient.invalidateQueries({
      queryKey: ['appointments', 'patient', patientId]
    });
    
    // Aussi invalider les listes générales d'appointments
    queryClient.invalidateQueries({
      queryKey: ['appointments']
    });
  };

  // New function to update patient data optimistically
  const updatePatientOptimistically = async (updatedData: PatientFormValues) => {
    if (!patient) return;

    // ✅ Patient mis à jour

    // Helper function to convert values to nullable numbers
    const toNullableNumber = (val: any) => {
      if (val === undefined || val === "" || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    // Process the data first
    const processedData = {
      ...updatedData,
      height: toNullableNumber(updatedData.height),
      weight: toNullableNumber(updatedData.weight),
      bmi: toNullableNumber(updatedData.bmi),
      weight_at_birth: toNullableNumber(updatedData.weight_at_birth),
      height_at_birth: toNullableNumber(updatedData.height_at_birth),
      head_circumference: toNullableNumber(updatedData.head_circumference),
    };

    const patientUpdate = {
      ...patient,
      ...processedData,
      updatedAt: new Date().toISOString(),
    };

    // Immediately update the UI
    queryClient.setQueryData(['patient', patientId], patientUpdate);

    try {
      // Make the actual API call
      const updatedPatient = await api.updatePatient(patientUpdate);
      
      // Update with the real data from server
      queryClient.setQueryData(['patient', patientId], updatedPatient);
      
      // Also invalidate the patients list to keep it in sync
      queryClient.invalidateQueries({
        queryKey: ['patients']
      });

      // ✅ Patient sauvegardé
      return updatedPatient;
    } catch (error) {
      console.error(`usePatientDetail: Error updating patient ${patientId}:`, error);
      // Revert on error by invalidating the query
      queryClient.invalidateQueries({
        queryKey: ['patient', patientId]
      });
      throw error;
    }
  };

  return {
    patient,
    appointments,
    invoices,
    isLoading: patientLoading || appointmentsLoading || invoicesLoading,
    error: patientError || appointmentsError || invoicesError,
    updateAppointmentStatusOptimistically,
    addAppointmentOptimistically,
    updatePatientOptimistically,
  };
}
