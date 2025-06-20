
export interface CalendarAppointment {
  id: number;
  time: string;
  patientName: string;
  reason: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'RESCHEDULED' | 'NO_SHOW';
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER' | 'Homme' | 'Femme' | null;
}

export interface AppointmentTooltipProps {
  date: Date;
  appointments: CalendarAppointment[];
}
