
import { api } from "@/services/api";
import { AppointmentConflictError } from "@/services/api/appointment-service";

// Function to check if there is a conflict with existing appointments
export async function checkAppointmentConflict(
  date: Date, 
  time: string, 
  excludeAppointmentId?: number
): Promise<boolean> {
  try {
    // Get all appointments
    const allAppointments = await api.getAppointments();
    
    // Parse the selected date and time
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    // Get 30 minutes after the selected time (appointments are assumed to be 30min)
    const endTime = new Date(selectedDateTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    // Check for conflicts
    const conflictingAppointment = allAppointments.find(appointment => {
      // Skip the current appointment being edited
      if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
        return false;
      }
      
      // Skip canceled appointments
      if (appointment.status === "CANCELED" || appointment.status === "NO_SHOW") {
        return false;
      }
      
      const appointmentDate = new Date(appointment.date);
      const appointmentEndTime = new Date(appointmentDate);
      appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + 30);
      
      // Check if times overlap
      return (
        (selectedDateTime < appointmentEndTime) && 
        (endTime > appointmentDate)
      );
    });
    
    return !!conflictingAppointment;
  } catch (error) {
    console.error("Erreur lors de la vérification des conflits de séances:", error);
    return false; // En cas d'erreur, permettre la séance d'être créée
  }
}

export { AppointmentConflictError };
