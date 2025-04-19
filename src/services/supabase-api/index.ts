
// Export the supabase client and utility functions
export * from './utils';

// Import and export the services
import { supabasePatientService } from './patient-service';
import { supabaseAuthService } from './auth-service';
import { supabaseAppointmentService } from './appointment-service';
import { supabaseCabinetService } from './cabinet-service';
import { supabaseInvoiceService } from './invoice-service';
import { supabaseOsteopathService } from './osteopath-service';

// Export services with aliases
export { supabasePatientService };
export { supabaseAuthService as authService };
export { supabaseAppointmentService as appointmentService };
export { supabaseCabinetService as cabinetService };
export { supabaseInvoiceService as invoiceService };
export { supabaseOsteopathService as osteopathService };

// Export a convenient single API object with all services
export const supabaseApi = {
  auth: supabaseAuthService,
  patients: supabasePatientService,
  appointments: supabaseAppointmentService,
  cabinets: supabaseCabinetService,
  invoices: supabaseInvoiceService,
  osteopaths: supabaseOsteopathService
};
