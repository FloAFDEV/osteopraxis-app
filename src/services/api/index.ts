
export { patientService, isPatientOwnedByCurrentOsteopath } from "./patient-service";
export { appointmentService } from "./appointment-service";
export { invoiceService } from "./invoice-service";
export { authService } from "./auth-service";
export { cabinetService } from "./cabinet-service";
export { osteopathService } from "./osteopath-service";

// Export quote service
export { quoteService } from "./quote-service";

// Export a convenient single API object with all services
export const api = {
  // Auth
  register: authService.register,
  login: authService.login,
  loginWithMagicLink: authService.loginWithMagicLink,
  logout: authService.logout,
  checkAuth: authService.checkAuth,
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
  deleteAppointment: appointmentService.deleteAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,

  // Invoices
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,

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
  getCurrentOsteopath: osteopathService.getCurrentOsteopath,
  createOsteopath: osteopathService.createOsteopath,
  updateOsteopath: osteopathService.updateOsteopath,
  deleteOsteopath: osteopathService.deleteOsteopath,

  // Quotes
  getQuotes: quoteService.getQuotes,
  getQuoteById: quoteService.getQuoteById,
  getQuotesByPatientId: quoteService.getQuotesByPatientId,
  createQuote: quoteService.createQuote,
  updateQuote: quoteService.updateQuote,
  deleteQuote: quoteService.deleteQuote,
  sendQuote: quoteService.sendQuote,
};
