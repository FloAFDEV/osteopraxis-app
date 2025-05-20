
// Export API services
export { api } from './api/index';

// Export Supabase client 
export { supabase } from '@/integrations/supabase/client';

// Export utility functions
export { typedData, ensureAppointmentStatus, AppointmentStatusValues } from './supabase-api/utils';
export { getCurrentOsteopathId, isSameOsteopath } from './supabase-api/utils/getCurrentOsteopath';
export { ensureOsteopathProfile } from './supabase-api/utils/ensureOsteopathProfile';

// Export date utilities
export { convertLocalToUTC, convertUTCToLocal, formatAppointmentDate, formatAppointmentTime } from '@/utils/date-utils';

// Export API errors for better handling
export { AppointmentConflictError } from './api/appointment-service';

// Export CORS headers
export { corsHeaders } from './corsHeaders';
