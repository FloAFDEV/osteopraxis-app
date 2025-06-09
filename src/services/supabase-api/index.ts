
// Export the supabase client and utility functions
export * from './utils';

// Import and export the services
import { patientService, supabasePatientService } from './patient-service';
import { supabaseAuthService } from './auth-service';
import { supabaseAppointmentService } from './appointment-service';
import { supabaseCabinetService } from './cabinet';
import { supabaseInvoiceService } from './invoice-service';
import { supabaseOsteopathService } from './osteopath-service';
import { supabaseQuoteService } from './quote-service';

// Export services with aliases
export { patientService, supabasePatientService };
export { supabaseAuthService as authService };
export { supabaseAppointmentService as appointmentService };
export { supabaseCabinetService as cabinetService };
export { supabaseInvoiceService as invoiceService };
export { supabaseOsteopathService as osteopathService };
export { supabaseQuoteService as quoteService };

// Export a convenient single API object with all services
export const supabaseApi = {
  auth: supabaseAuthService,
  patients: patientService,
  appointments: supabaseAppointmentService,
  cabinets: supabaseCabinetService,
  invoices: supabaseInvoiceService,
  osteopaths: supabaseOsteopathService,
  quotes: supabaseQuoteService
};
