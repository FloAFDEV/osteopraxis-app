
import { Appointment } from '@/types';

export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';

export interface Session extends Appointment {
  plannedTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  lastEditedAt?: string;
  autoSaved?: boolean;
}

// Étendre l'interface Appointment pour inclure les propriétés liées aux sessions
declare module '@/types' {
  interface Appointment {
    plannedTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    lastEditedAt?: string;
    autoSaved?: boolean;
    invoiceId?: number;
  }
}
