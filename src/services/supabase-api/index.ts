
// Export the supabase client and utility functions
export * from './utils';

// Export the patientService that already has a proper export
export { patientService, supabasePatientService } from './patient-service';

// Export supabaseAuthService from auth-service
export { supabaseAuthService as authService } from './auth-service';

// Export services from their respective files
export { supabaseAppointmentService as appointmentService } from './appointment-service';
export { supabaseCabinetService as cabinetService } from './cabinet-service';
export { supabaseInvoiceService as invoiceService } from './invoice-service';
export { supabaseOsteopathService as osteopathService } from './osteopath-service';

// Export a convenient single API object with all services
export const supabaseApi = {
  auth: authService,
  patients: patientService,
  appointments: appointmentService,
  cabinets: cabinetService,
  invoices: invoiceService,
  osteopaths: osteopathService
};
