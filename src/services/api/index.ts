
// Re-exporting services for the application API
import { appointmentService } from './appointment-service';
import { patientService } from './patient-service';
import { osteopathService } from './osteopath-service';
import { cabinetService } from './cabinet-service';
import { invoiceService } from './invoice-service';
import { authService } from './auth-service';

// Export services with a clean API surface
export const api = {
  // Auth related
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  getCurrentUser: authService.getCurrentUser,
  
  // Patient related
  getPatients: patientService.getPatients,
  getPatientById: patientService.getPatientById,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,
  
  // Appointment related - disable caching by adding Date.now() as query parameter
  getAppointments: async () => {
    console.log("Fetching appointments with cache busting");
    return appointmentService.getAppointments();
  },
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  deleteAppointment: appointmentService.deleteAppointment,
  
  // Cabinet related
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,
  
  // Invoice related
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,
  
  // Osteopath related
  getOsteopath: osteopathService.getOsteopath,
  updateOsteopath: osteopathService.updateOsteopath
};
