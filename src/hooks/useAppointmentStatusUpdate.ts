
import { useEffect } from 'react';
import { Appointment, AppointmentStatus } from '@/types';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface UseAppointmentStatusUpdateProps {
  appointments: Appointment[];
  onAppointmentsUpdate: (updatedAppointments: Appointment[]) => void;
}

export function useAppointmentStatusUpdate({
  appointments,
  onAppointmentsUpdate
}: UseAppointmentStatusUpdateProps) {
  useEffect(() => {
    const updateExpiredAppointments = async () => {
      const now = new Date();
      const appointmentsToUpdate: Appointment[] = [];
      
      // Trouver les rendez-vous qui devraient être marqués comme terminés
      appointments.forEach(appointment => {
        if (appointment.status === 'SCHEDULED' || appointment.status === 'RESCHEDULED') {
          const appointmentDate = new Date(appointment.date);
          // Ajouter 30 minutes (durée standard d'un rendez-vous) à la date du rendez-vous
          const appointmentEndTime = new Date(appointmentDate.getTime() + 30 * 60000);
          
          if (appointmentEndTime < now) {
            appointmentsToUpdate.push(appointment);
          }
        }
      });

      // Mettre à jour les rendez-vous expirés
      if (appointmentsToUpdate.length > 0) {
        try {
          const updatePromises = appointmentsToUpdate.map(appointment =>
            api.updateAppointmentStatus(appointment.id, 'COMPLETED')
          );
          
          const updatedAppointments = await Promise.all(updatePromises);
          
          // Mettre à jour la liste locale des rendez-vous
          const updatedAppointmentsList = appointments.map(appointment => {
            const updated = updatedAppointments.find(ua => ua.id === appointment.id);
            return updated || appointment;
          });
          
          onAppointmentsUpdate(updatedAppointmentsList);
          
          if (appointmentsToUpdate.length === 1) {
            toast.info('Un rendez-vous a été automatiquement marqué comme terminé');
          } else {
            toast.info(`${appointmentsToUpdate.length} rendez-vous ont été automatiquement marqués comme terminés`);
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour des statuts des rendez-vous:', error);
        }
      }
    };

    // Exécuter immédiatement
    updateExpiredAppointments();

    // Puis vérifier toutes les minutes
    const interval = setInterval(updateExpiredAppointments, 60000);

    return () => clearInterval(interval);
  }, [appointments, onAppointmentsUpdate]);
}
