
import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, User, Calendar } from "lucide-react";
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
      SCHEDULED: { label: "Planifié", variant: "default" as const, textColor: "text-blue-600 dark:text-blue-300" },
      COMPLETED: { label: "Terminé", variant: "secondary" as const, textColor: "text-green-600 dark:text-green-300" },
      CANCELED: { label: "Annulé", variant: "destructive" as const, textColor: "text-red-600 dark:text-red-300" },
      RESCHEDULED: { label: "Reporté", variant: "outline" as const, textColor: "text-orange-600 dark:text-orange-300" },
      NO_SHOW: { label: "Absence", variant: "outline" as const, textColor: "text-gray-600 dark:text-gray-300" }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const, textColor: "text-gray-600 dark:text-gray-300" };
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
          className="max-w-xs p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
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
                        {appointment.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-500 dark:text-gray-300 flex-shrink-0" />
                          <span className={`text-sm truncate ${statusInfo.textColor}`}>
                            {appointment.patientName}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${statusInfo.textColor} opacity-90`}>
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
