
import { delay, USE_SUPABASE } from "./config";

// Importer les services
import { authService } from "./auth-service";
import { patientService } from "./patient-service";
import { appointmentService } from "./appointment-service";
import { cabinetService } from "./cabinet-service";
import { invoiceService } from "./invoice-service";
import { osteopathService } from "./osteopath-service";

// Exporter l'API unifiée
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
  getPatientsByOsteopathId: patientService.getPatients, // Correction ici: utilisation de getPatients comme substitut temporaire
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,

  // Rendez-vous
  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  deleteAppointment: appointmentService.deleteAppointment,

  // Cabinets
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  getCabinetsByOsteopathId: cabinetService.getCabinetsByOsteopathId,
  getCabinetsByUserId: cabinetService.getCabinetsByUserId,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,

  // Ostéopathes
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
  getOsteopathByUserId: osteopathService.getOsteopathByUserId,
  updateOsteopath: osteopathService.updateOsteopath,
  createOsteopath: osteopathService.createOsteopath,
  
  // Factures
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  updatePaymentStatus: invoiceService.updatePaymentStatus,
  deleteInvoice: invoiceService.deleteInvoice,
  getInvoicesByPeriod: invoiceService.getInvoicesByPeriod,
  getInvoiceSummary: invoiceService.getInvoiceSummary,
  
  // Fonctions Admin
  async getAdminStats() {
    if (USE_SUPABASE) {
      // Implémentation future avec Supabase
      await delay(300);
      return {
        totalUsers: 0,
        totalOsteopaths: 0,
        totalCabinets: 0,
        totalPatients: 0,
        totalAppointments: 0
      };
    }
    
    // Version simulée
    await delay(500);
    
    return {
      totalUsers: 10,
      totalOsteopaths: 8,
      totalCabinets: 12,
      totalPatients: 120,
      totalAppointments: 350
    };
  }
};
