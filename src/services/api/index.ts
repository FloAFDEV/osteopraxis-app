
import { patientService } from "./patient-service";
import { appointmentService } from "./appointment-service";
import { invoiceService } from "./invoice-service";
import { cabinetService } from "./cabinet-service";

export const api = {
  getPatients: patientService.getPatients,
  getPatientById: patientService.getPatientById,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,

  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  getTodayAppointmentForPatient: appointmentService.getTodayAppointmentForPatient,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  cancelAppointment: appointmentService.cancelAppointment,
  deleteAppointment: appointmentService.deleteAppointment,

  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,
  generateInvoicePdf: invoiceService.generateInvoicePdf,

  getCabinets: cabinetService.getCabinets,
};
