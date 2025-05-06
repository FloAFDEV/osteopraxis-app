
import * as authService from './auth-service';
import * as patientService from './patient-service';
import * as appointmentService from './appointment-service';
import * as invoiceService from './invoice-service';
import * as osteopathService from './osteopath-service';
import * as cabinetService from './cabinet-service';

export const api = {
  // Auth services
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  checkAuth: authService.checkAuth,
  loginWithMagicLink: authService.loginWithMagicLink,
  promoteToAdmin: authService.promoteToAdmin,
  
  // Patient services
  getPatients: patientService.getPatients,
  getPatientById: patientService.getPatientById,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,
  searchPatients: patientService.searchPatients,
  getPatientsByOsteopathId: patientService.getPatientsByOsteopathId,
  getPatientCount: patientService.getPatientCount,
  
  // Appointment services
  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  deleteAppointment: appointmentService.deleteAppointment,
  getUpcomingAppointments: appointmentService.getUpcomingAppointments,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  getAppointmentsByOsteopathId: appointmentService.getAppointmentsByOsteopathId,
  getAppointmentCount: appointmentService.getAppointmentCount,
  cancelAppointment: appointmentService.cancelAppointment,
  rescheduleAppointment: appointmentService.rescheduleAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  
  // Invoice services
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  getInvoicesByOsteopathId: invoiceService.getInvoicesByOsteopathId,
  getInvoiceCount: invoiceService.getInvoiceCount,
  markInvoiceAsPaid: invoiceService.markInvoiceAsPaid,
  getInvoicesByAppointmentId: invoiceService.getInvoicesByAppointmentId,
  
  // Osteopath services
  getOsteopathById: osteopathService.getOsteopathById,
  getOsteopathByUserId: osteopathService.getOsteopathByUserId,
  createOsteopath: osteopathService.createOsteopath,
  updateOsteopath: osteopathService.updateOsteopath,
  getOsteopathProfile: osteopathService.getOsteopathProfile,
  updateOsteopathProfile: osteopathService.updateOsteopathProfile,
  getOsteopaths: osteopathService.getOsteopaths,
  
  // Cabinet services
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,
  getCabinetsByOsteopathId: cabinetService.getCabinetsByOsteopathId,
  getCabinetsByUserId: cabinetService.getCabinetsByUserId
};
