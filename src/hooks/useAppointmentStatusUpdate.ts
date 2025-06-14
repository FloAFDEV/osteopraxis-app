
import { Appointment } from '@/types';

// Ce hook ne fait plus rien : la clôture de séance se fait désormais manuellement
interface UseAppointmentStatusUpdateProps {
  appointments: Appointment[];
  onAppointmentsUpdate: (updatedAppointments: Appointment[]) => void;
}

export function useAppointmentStatusUpdate({
  appointments,
  onAppointmentsUpdate
}: UseAppointmentStatusUpdateProps) {
  // Ne fait volontairement plus rien
}
