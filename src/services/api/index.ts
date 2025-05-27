import { patientService } from "./patient-service";
import { appointmentService } from "./appointment-service";
import { invoiceService } from "./invoice-service";
import { paymentService } from "./payment-service";
import { userService } from "./user-service";
import { documentService } from "./document-service";
import { settingsService } from "./settings-service";
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

  getPayments: paymentService.getPayments,
  getPaymentById: paymentService.getPaymentById,
  getPaymentsByInvoiceId: paymentService.getPaymentsByInvoiceId,
  createPayment: paymentService.createPayment,
  updatePayment: paymentService.updatePayment,
  deletePayment: paymentService.deletePayment,

  getUserProfile: userService.getUserProfile,
  updateUserProfile: userService.updateUserProfile,

  getDocuments: documentService.getDocuments,
  getDocumentById: documentService.getDocumentById,
  getDocumentsByPatientId: documentService.getDocumentsByPatientId,
  createDocument: documentService.createDocument,
  updateDocument: documentService.updateDocument,
  deleteDocument: documentService.deleteDocument,

  getSettings: settingsService.getSettings,
  updateSettings: settingsService.updateSettings,
  getCabinets: cabinetService.getCabinets,
};
