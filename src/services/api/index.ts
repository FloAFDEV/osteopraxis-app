
import { authService } from './auth-service';
import { patientService } from './patient-service';
import { appointmentService } from './appointment-service';
import { cabinetService } from './cabinet-service';
import { osteopathService } from './osteopath-service';
import { userService } from './user-service';

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
  
  // Cabinets
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  getCabinetsByOsteopathId: cabinetService.getCabinetsByOsteopathId,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,
  
  // Osteopaths
  getOsteopaths: osteopathService.getOsteopaths,
  getOsteopathById: osteopathService.getOsteopathById,
  createOsteopath: osteopathService.createOsteopath,
  updateOsteopath: osteopathService.updateOsteopath,
  
  // Users
  updateUserOsteopathId: userService.updateUserOsteopathId,
  
  // Appointments
  getAppointments: appointmentService.getAppointments,
  getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
  createAppointment: appointmentService.createAppointment,
  updateAppointment: appointmentService.updateAppointment
};
