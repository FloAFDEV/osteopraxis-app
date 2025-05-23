
// Export utility functions first to avoid circular dependencies
export { convertLocalToUTC, convertUTCToLocal, formatAppointmentDate, formatAppointmentTime } from '@/utils/date-utils';

// Export CORS headers
export { corsHeaders } from './corsHeaders';

// Export utility functions
export { typedData, ensureAppointmentStatus, AppointmentStatusValues } from './supabase-api/utils';
export { 
  getCurrentOsteopathId, 
  getCurrentOsteopath,
  isSameOsteopath, 
  isPatientOwnedByCurrentOsteopath, 
  isCabinetOwnedByCurrentOsteopath,
  isAppointmentOwnedByCurrentOsteopath,
  isInvoiceOwnedByCurrentOsteopath
} from './supabase-api/utils/getCurrentOsteopath';
export { ensureOsteopathProfile } from './supabase-api/utils/ensureOsteopathProfile';

// Export API errors for better handling
export { AppointmentConflictError, SecurityViolationError } from './api/appointment-service';

// Export API services - this should come last to avoid circular dependencies
export { api } from './api/index';

// Export Supabase client - also last to avoid circular dependencies
export { supabase } from '@/integrations/supabase/client';
