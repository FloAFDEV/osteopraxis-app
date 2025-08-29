import React, { memo, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment, Patient } from "@/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Users, ExternalLink, User, X, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Composant optimisé pour les événements Google Calendar
export const GoogleEventCard = memo(({ 
  event, 
  compact = false 
}: { 
  event: any; 
  compact?: boolean; 
}) => {
  const eventStartTime = useMemo(() => 
    format(parseISO(event.start_time), "HH:mm"), 
    [event.start_time]
  );

  if (compact) {
    return (
      <div className={cn(
        "p-1 rounded text-xs truncate transition-colors hover:bg-primary/10",
        "bg-blue-100 text-blue-800 border-l-2 border-l-blue-500"
      )}>
        <div className="font-medium">{eventStartTime}</div>
        <div className="truncate">{event.summary}</div>
        {event.matched_patient_name && (
          <div className="text-green-700 text-xs">👤 {event.matched_patient_name}</div>
        )}
      </div>
    );
  }

  return (
    <Card className="hover-scale flex flex-col border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardContent className="p-3 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-blue-500 text-xs">
            {eventStartTime}
          </Badge>
          <div className="flex gap-1">
            {event.is_doctolib && (
              <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                Doctolib
              </Badge>
            )}
            <Badge variant="outline" className="text-blue-700 border-blue-300 text-xs">
              Google
            </Badge>
          </div>
        </div>
        <div className="mb-2">
          <h3 className="font-medium text-blue-900 truncate text-sm">
            {event.summary}
          </h3>
          {event.location && (
            <p className="text-xs text-blue-700 truncate">
              📍 {event.location}
            </p>
          )}
          {event.matched_patient_name && (
            <div className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                {event.matched_patient_name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="px-3 pb-2 flex justify-between items-center">
        <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
          Événement externe (lecture seule)
        </p>
        {event.matched_patient_id && (
          <Link
            to={`/patients/${event.matched_patient_id}`}
            className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Fiche patient
          </Link>
        )}
      </div>
    </Card>
  );
});

GoogleEventCard.displayName = 'GoogleEventCard';

// Composant optimisé pour les rendez-vous
export const AppointmentCard = memo(({ 
  appointment, 
  patient,
  compact = false,
  actionInProgress,
  onCancelAppointment,
  onDeleteAppointment
}: { 
  appointment: Appointment; 
  patient?: Patient;
  compact?: boolean;
  actionInProgress?: { id: number; action: "cancel" | "delete" } | null;
  onCancelAppointment?: (id: number) => void;
  onDeleteAppointment?: (id: number) => void;
}) => {
  const appointmentTime = useMemo(() => 
    format(parseISO(appointment.date), "HH:mm"), 
    [appointment.date]
  );

  const isProcessingAction = actionInProgress?.id === appointment.id;
  const isCompleted = appointment.status === "COMPLETED";

  const patientName = useMemo(() => 
    patient 
      ? `${patient.firstName} ${patient.lastName}`
      : `Patient #${appointment.patientId}`,
    [patient, appointment.patientId]
  );

  if (compact) {
    return (
      <Link
        to={`/appointments/${appointment.id}/edit`}
        className="block"
      >
        <div className={cn(
          "p-1 rounded text-xs truncate transition-colors hover:bg-primary/10",
          appointment.status === "COMPLETED" 
            ? "bg-green-100 text-green-800 border-l-2 border-l-green-500" 
            : "bg-blue-100 text-blue-800 border-l-2 border-l-blue-500"
        )}>
          <div className="font-medium">{appointmentTime}</div>
          <div className="truncate">{patientName}</div>
        </div>
      </Link>
    );
  }

  return (
    <Card className="hover-scale flex flex-col">
      <CardContent className="p-3 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-blue-500">
            {appointmentTime}
          </Badge>
          {isCompleted && (
            <Badge className="bg-amber-500">
              Terminé
            </Badge>
          )}
        </div>
        <Link
          to={`/appointments/${appointment.id}/edit`}
          className="block group mb-3"
        >
          <h3 className="font-medium group-hover:text-primary truncate">
            {patientName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {appointment.reason}
          </p>
        </Link>
      </CardContent>
      
      {/* Actions pour la vue complète */}
      {(onCancelAppointment || onDeleteAppointment) && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 p-2 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto text-destructive hover:bg-destructive/10 h-8 px-3 flex items-center justify-center space-x-1"
            onClick={() => onCancelAppointment?.(appointment.id)}
            disabled={isProcessingAction || isCompleted}
            title="Annuler cette séance"
          >
            {isProcessingAction && actionInProgress?.action === "cancel" && (
              <span className="animate-spin text-base">⏳</span>
            )}
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Annuler</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto text-destructive hover:bg-destructive/10 h-8 px-3 flex items-center justify-center"
            onClick={() => onDeleteAppointment?.(appointment.id)}
            disabled={isProcessingAction}
            title="Supprimer cette séance"
          >
            <Trash2 className="h-4 w-4 sm:mr-1" />
          </Button>
        </div>
      )}
    </Card>
  );
});

AppointmentCard.displayName = 'AppointmentCard';

// Composant optimisé pour les créneaux horaires
export const TimeSlotDisplay = memo(({ 
  timeSlot, 
  isCurrentTime 
}: { 
  timeSlot: string; 
  isCurrentTime: boolean; 
}) => (
  <div className="w-20 p-3 border-r bg-muted/20 flex items-center justify-center shrink-0">
    <span
      className={cn(
        "text-sm font-medium",
        isCurrentTime ? "text-primary" : "text-muted-foreground"
      )}
    >
      {timeSlot}
    </span>
  </div>
));

TimeSlotDisplay.displayName = 'TimeSlotDisplay';

// Hook optimisé pour les calculs coûteux
export const useOptimizedScheduleData = (
  appointments: Appointment[],
  patients: Patient[],
  date: Date
) => {
  const patientMap = useMemo(() => {
    const map = new Map<number, Patient>();
    patients.forEach(patient => map.set(patient.id, patient));
    return map;
  }, [patients]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const appointmentDate = parseISO(appointment.date);
        return (
          appointmentDate.toDateString() === date.toDateString() &&
          (appointment.status === "SCHEDULED" || appointment.status === "COMPLETED")
        );
      })
      .sort((a, b) => {
        const timeA = parseISO(a.date);
        const timeB = parseISO(b.date);
        return timeA.getTime() - timeB.getTime();
      });
  }, [appointments, date]);

  const getPatientById = useMemo(() => 
    (patientId: number) => patientMap.get(patientId),
    [patientMap]
  );

  return {
    dayAppointments,
    getPatientById,
    patientMap
  };
};