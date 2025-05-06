
import { login, register, logout, checkAuth, loginWithMagicLink, promoteToAdmin } from './auth-service';
import {
  getPatients, getPatientById, createPatient, updatePatient, deletePatient,
  searchPatients, getPatientsByOsteopathId, getPatientCount
} from './patient-service';
import {
  getAppointments, getAppointmentById, createAppointment, updateAppointment,
  deleteAppointment, getUpcomingAppointments, getAppointmentsByPatientId,
  getAppointmentsByOsteopathId, getAppointmentCount, cancelAppointment,
  rescheduleAppointment
} from './appointment-service';
import {
  getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice,
  getInvoicesByPatientId, getInvoicesByOsteopathId, getInvoiceCount,
  markInvoiceAsPaid
} from './invoice-service';
import { 
  getOsteopathById, getOsteopathByUserId, createOsteopath, updateOsteopath,
  getOsteopathProfile, updateOsteopathProfile
} from './osteopath-service';
import {
  getCabinets, getCabinetById, createCabinet, updateCabinet, deleteCabinet,
  getCabinetsByOsteopathId
} from './cabinet-service';

export const api = {
  login,
  register,
  logout,
  checkAuth,
  loginWithMagicLink,
  promoteToAdmin,
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientsByOsteopathId,
  getPatientCount,
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
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByPatientId,
  getInvoicesByOsteopathId,
  getInvoiceCount,
  markInvoiceAsPaid,
  getOsteopathById,
  getOsteopathByUserId,
  createOsteopath,
  updateOsteopath,
  getOsteopathProfile,
  updateOsteopathProfile,
  getCabinets,
  getCabinetById,
  createCabinet,
  updateCabinet,
  deleteCabinet,
  getCabinetsByOsteopathId
};
