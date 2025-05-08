
// Refactored appointment service that uses the modular files
import { Appointment } from "@/types";
import { 
  getAppointments,
  getAppointmentById,
  getAppointmentsByPatientId
} from "./appointment/appointment-queries";

import {
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment
} from "./appointment/appointment-mutations";

// Export the complete API
export const supabaseAppointmentService = {
  getAppointments,
  getAppointmentById,
  getAppointmentsByPatientId,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment
};
