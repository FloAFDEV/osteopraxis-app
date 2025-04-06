
// Point d'entrée principal pour l'API
// Réexporte tous les services API pour maintenir la compatibilité avec le code existant

import { authService } from './auth-service';
import { patientService } from './patient-service';
import { appointmentService } from './appointment-service';
import { cabinetService } from './cabinet-service';
import { osteopathService } from './osteopath-service';

// Api consolidée pour maintenir la compatibilité avec le code existant
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

  // Appointments
  getAppointments: appointmentService.getAppointments,
  getAppointmentById: appointmentService.getAppointmentById,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment,
  deleteAppointment: appointmentService.deleteAppointment,

  // Cabinet
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  updateCabinet: cabinetService.updateCabinet,

  // Osteopaths
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
};

// Exporter les services individuels pour un accès plus direct si nécessaire
export { authService, patientService, appointmentService, cabinetService, osteopathService };
