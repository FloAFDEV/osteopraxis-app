
// Re-exporting services for the application API
import { patientService } from "./api/patient-service";
import { osteopathService } from "./api/osteopath-service";
import { cabinetService } from "./api/cabinet-service";
import { invoiceService } from "./api/invoice-service";
import { authService } from "./api/auth-service";
import { 
  getCurrentOsteopath, 
  getCurrentOsteopathId,
  isPatientOwnedByCurrentOsteopath,
  isAppointmentOwnedByCurrentOsteopath,
  isInvoiceOwnedByCurrentOsteopath
} from "./supabase-api/utils/getCurrentOsteopath";

import { osteopathCabinetService } from "./supabase-api/osteopath-cabinet-service";

// Import appointment service separately to avoid circular dependency
import { appointmentService as baseAppointmentService } from "./api/appointment-service";

// Export services with a clean API surface
export const api = {
	// Auth related
	login: authService.login,
	register: authService.register,
	logout: authService.logout,
	checkAuth:
		authService.checkAuth ||
		(() => Promise.resolve({ isAuthenticated: false, user: null })),
	loginWithMagicLink:
		authService.loginWithMagicLink ||
		((email: string) => Promise.resolve()),
	promoteToAdmin:
		authService.promoteToAdmin ||
		((userId: string) => Promise.resolve(false)),

	// Patient related
	getPatients: patientService.getPatients,
	getPatientById: patientService.getPatientById,
	createPatient: patientService.createPatient,
	updatePatient: patientService.updatePatient,
	deletePatient: patientService.deletePatient,

	// Appointment related - using the base service directly
	getAppointments: async () => {
		console.log("Fetching appointments with cache busting");
		return baseAppointmentService.getAppointments();
	},
	getAppointmentById: baseAppointmentService.getAppointmentById,
	getAppointmentsByPatientId: baseAppointmentService.getAppointmentsByPatientId,
	getTodayAppointmentForPatient: baseAppointmentService.getTodayAppointmentForPatient,
	createAppointment: baseAppointmentService.createAppointment,
	updateAppointment: baseAppointmentService.updateAppointment,
	updateAppointmentStatus: baseAppointmentService.updateAppointmentStatus,
	cancelAppointment: baseAppointmentService.cancelAppointment,
	deleteAppointment: baseAppointmentService.deleteAppointment,

	// Cabinet related
	getCabinets: cabinetService.getCabinets,
	getCabinetById: cabinetService.getCabinetById,
	createCabinet: cabinetService.createCabinet,
	updateCabinet: cabinetService.updateCabinet,
	deleteCabinet: cabinetService.deleteCabinet,
	getCabinetsByUserId:
		cabinetService.getCabinetsByUserId || (() => Promise.resolve([])),
	getCabinetsByOsteopathId:
		cabinetService.getCabinetsByOsteopathId ||
		((id: number) => Promise.resolve([])),

	// Invoice related
	getInvoices: invoiceService.getInvoices,
	getInvoiceById: invoiceService.getInvoiceById,
	getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
	getInvoicesByAppointmentId: invoiceService.getInvoicesByAppointmentId,
	createInvoice: invoiceService.createInvoice,
	updateInvoice: invoiceService.updateInvoice,
	deleteInvoice: invoiceService.deleteInvoice,

	// Osteopath related
	getOsteopaths:
		osteopathService.getOsteopaths || (() => Promise.resolve([])),
	getOsteopathById:
		osteopathService.getOsteopathById ||
		((id: number) => Promise.resolve(undefined)),
	getOsteopathByUserId:
		osteopathService.getOsteopathByUserId ||
		((userId: string) => Promise.resolve(undefined)),
	updateOsteopath: osteopathService.updateOsteopath,
	createOsteopath:
		osteopathService.createOsteopath ||
		((data: any) => Promise.resolve({} as any)),
	getCurrentOsteopath: getCurrentOsteopath,
};

// Export utility functions directly
export { 
  getCurrentOsteopathId,
  isPatientOwnedByCurrentOsteopath,
  isAppointmentOwnedByCurrentOsteopath,
  isInvoiceOwnedByCurrentOsteopath
};

export * from "./api/invoice-service";

// Vérifier si un cabinet appartient à l'ostéopathe connecté (avec la nouvelle logique multi-cabinet)
export async function isCabinetOwnedByCurrentOsteopath(cabinetId: number): Promise<boolean> {
  try {
    const currentOsteopath = await getCurrentOsteopath();
    if (!currentOsteopath || !currentOsteopath.id) {
      return false;
    }

    // Vérifier via les associations ostéopathe-cabinet
    const osteopathCabinets = await osteopathCabinetService.getOsteopathCabinets(currentOsteopath.id);
    return osteopathCabinets.includes(cabinetId);
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété du cabinet:", error);
    return false;
  }
}
