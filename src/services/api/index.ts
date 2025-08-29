
import { appointmentService } from "./appointment-service";
import { patientService } from "./patient-service";
import { cabinetService } from "./cabinet-service";
import { osteopathService } from "./osteopath-service";
import { invoiceService } from "./invoice-service";
import { authService } from "./auth-service";
import { demoPatientRelationshipService } from "./demo-patient-relationship-service";

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
  getCabinetsByUserId: cabinetService.getCabinetsByUserId || (() => Promise.resolve([])),
  getCabinetsByOsteopathId: cabinetService.getCabinetsByOsteopathId || (() => Promise.resolve([])),
  
  // Cabinet associations
  associateOsteopathToCabinet: cabinetService.associateOsteopathToCabinet || (() => Promise.resolve()),
  dissociateOsteopathFromCabinet: cabinetService.dissociateOsteopathFromCabinet || (() => Promise.resolve()),
  getOsteopathCabinets: cabinetService.getOsteopathCabinets || (() => Promise.resolve([])),

  // Osteopaths
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
  getOsteopathByUserId: osteopathService.getOsteopathByUserId,
  createOsteopath: osteopathService.createOsteopath,
  updateOsteopath: osteopathService.updateOsteopath,
  deleteOsteopath: osteopathService.deleteOsteopath || (() => Promise.resolve(true)),

  // Invoices
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  getInvoicesByAppointmentId: invoiceService.getInvoicesByAppointmentId,
  createInvoice: invoiceService.createInvoice,  
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,

  // Patient Relationships
  getPatientRelationships: demoPatientRelationshipService.getPatientRelationships,
  getAllPatientRelationships: demoPatientRelationshipService.getAllPatientRelationships,
  createPatientRelationship: demoPatientRelationshipService.createPatientRelationship,
  updatePatientRelationship: demoPatientRelationshipService.updatePatientRelationship,
  deletePatientRelationship: demoPatientRelationshipService.deletePatientRelationship,

  // Auth
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  checkAuth: authService.checkAuth,
  getCurrentUser: authService.getCurrentUser || (() => Promise.resolve(null)),
  loginWithMagicLink: authService.loginWithMagicLink || (() => Promise.resolve()),
  promoteToAdmin: authService.promoteToAdmin || (() => Promise.resolve(false)),

  // Utility functions
  getCurrentOsteopath: async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.osteopathId) {
        return await osteopathService.getOsteopathById(user.osteopathId);
      }
      return null;
    } catch (error) {
      console.error("Error getting current osteopath:", error);
      return null;
    }
  },

  // Services accessors for demo context injection
  getAppointmentService: () => appointmentService,
  getPatientService: () => patientService,
  getCabinetService: () => cabinetService,
  getInvoiceService: () => invoiceService,
};

export default api;
