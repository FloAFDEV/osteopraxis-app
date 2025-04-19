
// Import all service modules
import { authService } from './auth-service';
import { patientService } from './patient-service';
import { appointmentService } from './appointment-service';
import { consultationService } from './consultation-service';
import { invoiceService } from './invoice-service';
import { osteopathService } from './osteopath-service';
import { professionalProfileService } from './professional-profile-service';
import { cabinetService } from './cabinet-service';
import { userService } from './user-service';
import { USE_SUPABASE } from './config';

// Export unified API interface
export const api = {
  // Auth
  login: authService.login,
  loginWithMagicLink: authService.loginWithMagicLink,
  register: authService.register,
  logout: authService.logout,
  getSession: authService.getSession,
  getCurrentUser: authService.getCurrentUser,
  promoteToAdmin: authService.promoteToAdmin,
  
  // User
  createUser: userService.createUser,
  getUserById: userService.getUserById,
  updateUser: userService.updateUser,
  updateUserRole: userService.updateUserRole,
  
  // Patient
  getPatients: patientService.getPatients,
  getPatientById: patientService.getPatientById,
  createPatient: patientService.createPatient,
  updatePatient: patientService.updatePatient,
  deletePatient: patientService.deletePatient,
  getPatientsByLetter: patientService.getPatientsByLetter,
  searchPatients: patientService.searchPatients,
  
  // Appointment
  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  deleteAppointment: appointmentService.deleteAppointment,
  
  // Consultation
  getConsultations: consultationService.getConsultations,
  getConsultationById: consultationService.getConsultationById,
  createConsultation: consultationService.createConsultation,
  updateConsultation: consultationService.updateConsultation,
  deleteConsultation: consultationService.deleteConsultation,
  
  // Invoice
  getInvoices: invoiceService.getInvoices,
  getInvoiceById: invoiceService.getInvoiceById,
  createInvoice: invoiceService.createInvoice,
  updateInvoice: invoiceService.updateInvoice,
  deleteInvoice: invoiceService.deleteInvoice,
  
  // Osteopath
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
  createOsteopath: osteopathService.createOsteopath,
  updateOsteopath: osteopathService.updateOsteopath,
  deleteOsteopath: osteopathService.deleteOsteopath,
  getOsteopathByUserId: osteopathService.getOsteopathByUserId,
  
  // ProfessionalProfile
  getProfessionalProfiles: professionalProfileService.getProfessionalProfiles,
  getProfessionalProfileById: professionalProfileService.getProfessionalProfileById,
  createProfessionalProfile: professionalProfileService.createProfessionalProfile,
  updateProfessionalProfile: professionalProfileService.updateProfessionalProfile,
  deleteProfessionalProfile: professionalProfileService.deleteProfessionalProfile,
  getProfessionalProfileByUserId: professionalProfileService.getProfessionalProfileByUserId,
  
  // Cabinet
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,
  getCabinetsByProfessionalProfileId: cabinetService.getCabinetsByProfessionalProfileId,
};
