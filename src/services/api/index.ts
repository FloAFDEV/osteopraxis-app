import { patientService } from "./patient-service";
import { appointmentService } from "./appointment-service";
import { cabinetService } from "./cabinet-service";
import { osteopathService } from "./osteopath-service";
import { invoiceService } from "./invoice-service";
import { authService } from "./auth-service";

export const api = {
  // Auth
  getSession: authService.getSession,
  login: authService.login,
  register: authService.register,
  logout: authService.logout, 
  checkAuth: authService.checkAuth,
  loginWithMagicLink: authService.loginWithMagicLink,
  promoteToAdmin: authService.promoteToAdmin,
  
  // Patients
  getPatients: patientService.getPatients,
  getPatientById: patientService.getPatientById,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,
  
  // Appointments
  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  deleteAppointment: appointmentService.deleteAppointment,
  
  // Cabinets
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  getCabinetsByOsteopathId: cabinetService.getCabinetsByOsteopathId,
  getCabinetsByUserId: cabinetService.getCabinetsByUserId,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,
  
  // Osteopaths
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
  getOsteopathByUserId: osteopathService.getOsteopathByUserId,
  updateOsteopath: osteopathService.updateOsteopath,
  createOsteopath: osteopathService.createOsteopath,
  
  // Invoices
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  updatePaymentStatus: invoiceService.updatePaymentStatus,
  deleteInvoice: invoiceService.deleteInvoice,
  getInvoicesByPeriod: invoiceService.getInvoicesByPeriod,
  getInvoiceSummary: invoiceService.getInvoiceSummary,
};

export type Api = typeof api;
