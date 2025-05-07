import { Appointment } from "@/types";
import { api } from "@/services/api";

export const checkAppointmentConflict = async (date: Date, time: string): Promise<boolean> => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Fetch all appointments for the given date
    const appointments = await api.getAppointments();
    
    // Check if there are any conflicting appointments
    const hasConflict = appointments.some(existingAppointment => {
      const existingAppointmentTime = new Date(existingAppointment.date);
      
      return (
        existingAppointmentTime.getDate() === appointmentDateTime.getDate() &&
        existingAppointmentTime.getMonth() === appointmentDateTime.getMonth() &&
        existingAppointmentTime.getFullYear() === appointmentDateTime.getFullYear() &&
        existingAppointmentTime.getHours() === appointmentDateTime.getHours() &&
        existingAppointmentTime.getMinutes() === appointmentDateTime.getMinutes()
      );
    });

    return hasConflict;
  } catch (error) {
    console.error("Error checking appointment conflicts:", error);
    return false;
  }
};

/**
 * Sets up browser inactivity detection
 * @param onInactive Callback to execute when inactivity is detected
 * @param timeout Timeout in milliseconds (default: 10 minutes)
 */
export const setupInactivityDetection = (
  onInactive: () => void, 
  timeout: number = 600000 // 10 minutes
) => {
  let inactivityTimer: NodeJS.Timeout;
  
  // Reset the timer on user activity
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(onInactive, timeout);
  };
  
  // Set up event listeners for user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  // Add event listeners
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  // Initialize timer
  resetInactivityTimer();
  
  // Return cleanup function
  return () => {
    clearTimeout(inactivityTimer);
    events.forEach(event => {
      document.removeEventListener(event, resetInactivityTimer, true);
    });
  };
};
