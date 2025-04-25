
import { format, setHours, setMinutes } from "date-fns";
import { api } from "@/services/api";
import { Appointment } from "@/types";

// Error class for appointment conflicts
export class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentConflictError';
  }
}

export const checkAppointmentConflict = async (date: Date, time: string): Promise<boolean> => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentTime = setMinutes(setHours(date, hours), minutes);
    const appointments = await api.getAppointments();
    
    // Filter active appointments at the same time
    const conflictingAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointment.status !== 'CANCELED' &&
        appointment.status !== 'NO_SHOW' &&
        format(appointmentDate, 'yyyy-MM-dd HH:mm') === format(appointmentTime, 'yyyy-MM-dd HH:mm')
      );
    });

    return conflictingAppointments.length > 0;
  } catch (error) {
    console.error('Error checking appointment conflicts:', error);
    throw error;
  }
};
