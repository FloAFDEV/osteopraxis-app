
import { appointmentService } from "./appointment-service";
import { patientService } from "./patient-service";
import { cabinetService } from "./cabinet-service";
import { osteopathService } from "./osteopath-service";
import { invoiceService } from "./invoice-service";
import { authService } from "./auth-service";

// Export des services principaux
export const api = {
  // Appointments
  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  getTodayAppointmentForPatient: appointmentService.getTodayAppointmentForPatient,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  cancelAppointment: appointmentService.cancelAppointment,
  deleteAppointment: appointmentService.deleteAppointment,

  // Patients
  getPatients: patientService.getPatients,
  getPatientById: patientService.getPatientById,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,

  // Cabinets
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,

  // Osteopaths
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
  createOsteopath: osteopathService.createOsteopath,
  updateOsteopath: osteopathService.updateOsteopath,
  deleteOsteopath: osteopathService.deleteOsteopath,

  // Invoices
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  getInvoicesByAppointmentId: invoiceService.getInvoicesByAppointmentId,
  createInvoice: invoiceService.createInvoice,  
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,

  // Auth
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  getCurrentUser: authService.getCurrentUser,
};

export default api;
