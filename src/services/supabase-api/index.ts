
// Réexporte tous les services Supabase API pour maintenir la compatibilité avec le code existant

import { supabaseAuthService } from './auth-service';
import { supabasePatientService } from './patient-service';
import { supabaseAppointmentService } from './appointment-service';
import { supabaseCabinetService } from './cabinet-service';
import { supabaseOsteopathService } from './osteopath-service';

// Supabase API consolidée pour maintenir la compatibilité avec le code existant
export const supabaseApi = {
  // Auth
  register: supabaseAuthService.register,
  login: supabaseAuthService.login,
  loginWithMagicLink: supabaseAuthService.loginWithMagicLink,
  logout: supabaseAuthService.logout,
  checkAuth: supabaseAuthService.checkAuth,
  promoteToAdmin: supabaseAuthService.promoteToAdmin,

  // Patients
  getPatients: supabasePatientService.getPatients,
  getPatientById: supabasePatientService.getPatientById,
  createPatient: supabasePatientService.createPatient,
  updatePatient: supabasePatientService.updatePatient,

  // Appointments
  getAppointments: supabaseAppointmentService.getAppointments,
  getAppointmentById: supabaseAppointmentService.getAppointmentById,
  getAppointmentsByPatientId: supabaseAppointmentService.getAppointmentsByPatientId,
  createAppointment: supabaseAppointmentService.createAppointment,
  updateAppointment: supabaseAppointmentService.updateAppointment,
  deleteAppointment: supabaseAppointmentService.deleteAppointment,

  // Cabinet
  getCabinets: supabaseCabinetService.getCabinets,
  getCabinetById: supabaseCabinetService.getCabinetById,
  updateCabinet: supabaseCabinetService.updateCabinet,

  // Osteopaths
  getOsteopaths: supabaseOsteopathService.getOsteopaths,
  getOsteopathById: supabaseOsteopathService.getOsteopathById
};

// Exporter les services individuels pour un accès plus direct
export { 
  supabaseAuthService, 
  supabasePatientService, 
  supabaseAppointmentService, 
  supabaseCabinetService, 
  supabaseOsteopathService 
};
