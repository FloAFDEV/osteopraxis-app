
export interface CalendarAppointment {
  id: number;
  time: string;
  patientName: string;
  reason: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'RESCHEDULED' | 'NO_SHOW';
}

export interface AppointmentTooltipProps {
  date: Date;
  appointments: CalendarAppointment[];
}
