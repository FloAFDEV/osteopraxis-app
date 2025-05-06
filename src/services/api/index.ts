
import {
  login, register, logout, checkAuth, loginWithMagicLink, promoteToAdmin
} from './auth-service';
import {
  getPatients, getPatientById, createPatient, updatePatient, deletePatient,
  searchPatients, getPatientsByOsteopathId, getPatientCount
} from './patient-service';
import {
  getAppointments, getAppointmentById, createAppointment, updateAppointment,
  deleteAppointment, getUpcomingAppointments, getAppointmentsByPatientId,
  getAppointmentsByOsteopathId, getAppointmentCount, cancelAppointment,
  rescheduleAppointment, updateAppointmentStatus
} from './appointment-service';
import {
  getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice,
  getInvoicesByPatientId, getInvoicesByOsteopathId, getInvoiceCount,
  markInvoiceAsPaid, getInvoicesByAppointmentId
} from './invoice-service';
import { 
  getOsteopathById, getOsteopathByUserId, createOsteopath, updateOsteopath,
  getOsteopathProfile, updateOsteopathProfile, getOsteopaths
} from './osteopath-service';
import {
  getCabinets, getCabinetById, createCabinet, updateCabinet, deleteCabinet,
  getCabinetsByOsteopathId, getCabinetsByUserId
} from './cabinet-service';

export const api = {
  // Auth services
  login,
  register,
  logout,
  checkAuth,
  loginWithMagicLink,
  promoteToAdmin,
  
  // Patient services
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientsByOsteopathId,
  getPatientCount,
  
  // Appointment services
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  getAppointmentsByPatientId,
  getAppointmentsByOsteopathId,
  getAppointmentCount,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  
  // Invoice services
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByPatientId,
  getInvoicesByOsteopathId,
  getInvoiceCount,
  markInvoiceAsPaid,
  getInvoicesByAppointmentId,
  
  // Osteopath services
  getOsteopathById,
  getOsteopathByUserId,
  createOsteopath,
  updateOsteopath,
  getOsteopathProfile,
  updateOsteopathProfile,
  getOsteopaths,
  
  // Cabinet services
  getCabinets,
  getCabinetById,
  createCabinet,
  updateCabinet,
  deleteCabinet,
  getCabinetsByOsteopathId,
  getCabinetsByUserId
};
