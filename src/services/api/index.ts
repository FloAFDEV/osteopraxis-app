// Re-exporting services for the application API
import { appointmentService } from "./appointment-service";
import { patientService } from "./patient-service";
import { osteopathService } from "./osteopath-service";
import { cabinetService } from "./cabinet-service";
import { invoiceService } from "./invoice-service";
import { authService } from "./auth-service";

// Export services with a clean API surface
export const api = {
	// Auth related
	login: authService.login,
	register: authService.register,
	logout: authService.logout,
	// Correction : enlever getCurrentUser si la méthode n'existe pas dans l'objet de référence
	// getCurrentUser: authService.getCurrentUser || (() => Promise.resolve(null)),
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
	deletePatient: patientService.deletePatient, // ajout

	// Appointment related
	getAppointments: async () => {
		console.log("Fetching appointments with cache busting");
		return appointmentService.getAppointments();
	},
	getAppointmentById: appointmentService.getAppointmentById,
	getAppointmentsByPatientId: appointmentService.getAppointmentsByPatientId,
	createAppointment: appointmentService.createAppointment,
	updateAppointment: appointmentService.updateAppointment,
	updateAppointmentStatus: appointmentService.updateAppointmentStatus,
	cancelAppointment: appointmentService.cancelAppointment, // Ajout de la nouvelle méthode
	deleteAppointment: appointmentService.deleteAppointment, // ajout

	// Cabinet related
	getCabinets: cabinetService.getCabinets,
	getCabinetById: cabinetService.getCabinetById,
	createCabinet: cabinetService.createCabinet,
	updateCabinet: cabinetService.updateCabinet,
	deleteCabinet: cabinetService.deleteCabinet, // ajout
	getCabinetsByUserId:
		cabinetService.getCabinetsByUserId || (() => Promise.resolve([])),
	getCabinetsByOsteopathId:
		cabinetService.getCabinetsByOsteopathId ||
		((id: number) => Promise.resolve([])),

	// Invoice related
	getInvoices: invoiceService.getInvoices,
	getInvoiceById: invoiceService.getInvoiceById,
	getInvoicesByPatientId: invoiceService.getInvoicesByPatientId,
	createInvoice: invoiceService.createInvoice,
	updateInvoice: invoiceService.updateInvoice,
	deleteInvoice: invoiceService.deleteInvoice, // ajout

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
};

export * from "./invoice-service";
