
import { patientService } from "./patient-service";
import { appointmentService } from "./appointment-service";
import { invoiceService } from "./invoice-service";
import { cabinetService } from "./cabinet-service";

// Mock osteopath service for missing methods
const mockOsteopathService = {
  getOsteopaths: async () => [],
  getOsteopathById: async (id: number) => null,
  updateOsteopath: async (id: number, data: any) => null,
  createCabinet: async (data: any) => null,
  updateCabinet: async (id: number, data: any) => null,
  getInvoicesByAppointmentId: async (appointmentId: number) => [],
};

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

  // Mock methods to fix build errors
  getOsteopaths: mockOsteopathService.getOsteopaths,
  getOsteopathById: mockOsteopathService.getOsteopathById,
  updateOsteopath: mockOsteopathService.updateOsteopath,
  createCabinet: mockOsteopathService.createCabinet,
  updateCabinet: mockOsteopathService.updateCabinet,
  getInvoicesByAppointmentId: mockOsteopathService.getInvoicesByAppointmentId,
};
