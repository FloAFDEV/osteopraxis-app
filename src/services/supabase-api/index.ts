
// Export the supabase client and utility functions
export * from './utils';

// Export supabase services
export { default as patientService } from './patient-service';
export { default as authService } from './auth-service';

// Add these lines if they're missing proper exports
// We need to ensure all services are exported correctly
import { default as appointmentService } from './appointment-service';
import { default as cabinetService } from './cabinet-service';
import { default as invoiceService } from './invoice-service';
import { default as osteopathService } from './osteopath-service';

export { 
  appointmentService, 
  cabinetService, 
  invoiceService, 
  osteopathService
};
