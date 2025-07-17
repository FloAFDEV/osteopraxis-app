import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment, Patient } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyScheduleViewProps {
  appointments: Appointment[];
  patients: Patient[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthlyScheduleView({
  appointments,
  patients,
  selectedDate,
  onDateChange,
  onDayClick
}: MonthlyScheduleViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const getPatientById = (patientId: number) => {
    return patients.find((patient) => patient.id === patientId);
  };

  const getDayAppointments = (date: Date) => {
    return appointments
      .filter((appointment) => {
        const appointmentDate = parseISO(appointment.date);
        return (
          isSameDay(appointmentDate, date) &&
          (appointment.status === "SCHEDULED" ||
            appointment.status === "COMPLETED")
        );
      })
      .sort((a, b) => {
        const timeA = parseISO(a.date);
        const timeB = parseISO(b.date);
        return timeA.getTime() - timeB.getTime();
      });
  };

  const navigateToPreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onDateChange(newMonth);
  };

  const navigateToNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onDateChange(newMonth);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateChange(today);
  };

  // Calculer les jours à afficher (incluant les jours partiels des semaines précédente/suivante)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Grouper par semaines
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-4">
      {/* Navigation du mois */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateToPreviousMonth}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Mois précédent
        </Button>

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToToday}
          >
            Aujourd'hui
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={navigateToNextMonth}
          className="flex items-center gap-2"
        >
          Mois suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendrier mensuel */}
      <Card>
        <CardContent className="p-4">
          {/* En-têtes des jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Semaines */}
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((day) => {
                  const dayAppointments = getDayAppointments(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isDayToday = isToday(day);
                  const hasAppointments = dayAppointments.length > 0;

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[100px] p-2 border rounded-lg transition-colors group cursor-pointer",
                        isCurrentMonth 
                          ? "bg-background hover:bg-muted/50" 
                          : "bg-muted/30 text-muted-foreground",
                        isDayToday && "ring-2 ring-primary"
                      )}
                      onClick={() => onDayClick?.(day)}
                    >
                      {/* Numéro du jour */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-sm font-medium",
                          isDayToday && "text-primary font-bold"
                        )}>
                          {format(day, "d")}
                        </span>
                        {isCurrentMonth && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Rendez-vous du jour */}
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => {
                          const patient = getPatientById(appointment.patientId);
                          const appointmentTime = format(parseISO(appointment.date), "HH:mm");
                          
                          return (
                            <div
                              key={appointment.id}
                              className={cn(
                                "p-1 rounded text-xs truncate transition-colors cursor-pointer",
                                appointment.status === "COMPLETED" 
                                  ? "bg-green-100 text-green-800 border-l-2 border-l-green-500 hover:bg-green-200 hover:text-green-900" 
                                  : "bg-blue-100 text-blue-800 border-l-2 border-l-blue-500 hover:bg-blue-200 hover:text-blue-900"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Optionnel : naviguer vers l'édition du rendez-vous
                                // navigate(`/appointments/${appointment.id}/edit`);
                              }}
                            >
                              <div className="font-medium">
                                {appointmentTime}
                              </div>
                              <div className="truncate">
                                {patient 
                                  ? `${patient.firstName} ${patient.lastName}`
                                  : `Patient #${appointment.patientId}`
                                }
                              </div>
                            </div>
                          );
                        })}

                        {/* Indicateur s'il y a plus de rendez-vous */}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{dayAppointments.length - 3} autres
                          </div>
                        )}

                        {/* État vide pour les jours sans rendez-vous */}
                        {dayAppointments.length === 0 && isCurrentMonth && (
                          <div className="text-center py-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            Cliquer pour ajouter
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border-l-2 border-l-blue-500 rounded"></div>
          <span>Rendez-vous planifié</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border-l-2 border-l-green-500 rounded"></div>
          <span>Rendez-vous terminé</span>
        </div>
      </div>
    </div>
  );
}