
// Re-export all services for unified access
export { supabase } from './utils';
export { supabaseAuthService } from './auth-service';
export { patientService as supabasePatientService } from './patient-service';
export { appointmentService } from './appointment-service';
export { cabinetService } from './cabinet-service';
export { invoiceService } from './invoice-service';
