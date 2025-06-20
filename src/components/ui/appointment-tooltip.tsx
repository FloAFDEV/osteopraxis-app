import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, User, Calendar, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarAppointment } from "@/types/calendar";

interface AppointmentTooltipProps {
  date: Date;
  appointments: CalendarAppointment[];
  children: React.ReactNode;
}

export function AppointmentTooltip({ date, appointments, children }: AppointmentTooltipProps) {
  if (appointments.length === 0) {
    return <>{children}</>;
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SCHEDULED: { label: "Planifié", variant: "default" as const },
      COMPLETED: { label: "Terminé", variant: "secondary" as const },
      CANCELED: { label: "Annulé", variant: "destructive" as const },
      RESCHEDULED: { label: "Reporté", variant: "outline" as const },
      NO_SHOW: { label: "Absence", variant: "outline" as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const };
  };

  const getGenderIcon = (gender?: string | null) => {
    if (gender === "Homme" || gender === "MALE") {
      return <UserIcon className="h-3 w-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
    } else if (gender === "Femme" || gender === "FEMALE") {
      return <UserIcon className="h-3 w-3 text-pink-500 dark:text-pink-400 flex-shrink-0" />;
    } else {
      // Vert pour les enfants ou genre non spécifié
      return <UserIcon className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />;
    }
  };

  const formatAppointmentTime = (timeString: string) => {
    try {
      // Si c'est déjà au format HH:mm
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      // Si c'est un timestamp ISO
      const date = new Date(timeString);
      return format(date, "HH:mm");
    } catch {
      return timeString; // Retourner tel quel si erreur
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-[99]"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
              <Calendar className="h-4 w-4" />
              <span>{format(date, "EEEE d MMMM", { locale: fr })}</span>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sortedAppointments.slice(0, 5).map((appointment) => {
                const statusInfo = getStatusBadge(appointment.status);
                return (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Clock className="h-3 w-3 text-gray-500 dark:text-gray-300 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {formatAppointmentTime(appointment.time)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          {getGenderIcon(appointment.patientGender)}
                          <span className="text-sm truncate font-medium text-gray-700 dark:text-gray-200">
                            {appointment.patientName}
                          </span>
                        </div>
                        <p className="text-xs truncate text-gray-600 dark:text-gray-400 opacity-90">
                          {appointment.reason}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={statusInfo.variant}
                      className="text-xs flex-shrink-0"
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })}
              
              {appointments.length > 5 && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-600">
                  +{appointments.length - 5} autres rendez-vous
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
