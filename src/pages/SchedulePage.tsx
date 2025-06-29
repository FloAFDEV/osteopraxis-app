
import React, { useState, useMemo } from "react";
import { Calendar, Clock, Plus, Users, RefreshCw, ExternalLink } from "lucide-react";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { cn } from "@/lib/utils";

const SchedulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { events: googleEvents, isConnected: isGoogleConnected } = useGoogleCalendar();

  // Fetch appointments for the current week
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const { data: appointmentsData = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => api.getAppointments(),
    enabled: !!user?.osteopathId
  });

  // Fetch patients for name lookup
  const { data: patientsData = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.getPatients(),
    enabled: !!user?.osteopathId
  });

  // Combine appointments with Google events
  const combinedAppointments = useMemo(() => {
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

    // Map Google events to appointment-like objects
    const mappedGoogleEvents = googleEvents.map(event => ({
      id: event.id,
      date: event.start_time,
      status: event.status,
      isGoogleEvent: true,
      summary: event.summary,
      patient: event.patient || null,
      reason: event.description || null,
    }));

    // Map regular appointments and add patient info
    const mappedAppointments = appointments.map(apt => {
      const patient = patientsData.find(p => p.id === apt.patientId);
      return {
        id: apt.id,
        date: apt.date,
        status: apt.status,
        isGoogleEvent: false,
        patient: patient || null,
        reason: apt.reason,
      };
    });

    // Combine and sort by date
    return [...mappedAppointments, ...mappedGoogleEvents].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [appointmentsData, googleEvents, patientsData]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  const getEventStyle = (appointment: any) => {
    if (appointment.isGoogleEvent) {
      return "bg-blue-100 border-blue-300 text-blue-800";
    }
    
    switch (appointment.status) {
      case 'SCHEDULED':
        return "bg-green-100 border-green-300 text-green-800";
      case 'COMPLETED':
        return "bg-gray-100 border-gray-300 text-gray-800";
      case 'CANCELED':
        return "bg-red-100 border-red-300 text-red-800";
      case 'RESCHEDULED':
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      default:
        return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  const renderAppointmentCard = (appointment: any) => (
    <div
      key={appointment.id}
      className={cn(
        "p-2 mb-1 border-l-4 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow",
        getEventStyle(appointment)
      )}
      onClick={() => {
        if (!appointment.isGoogleEvent) {
          navigate(`/appointments/${appointment.id}/edit`);
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">
          {format(parseISO(appointment.date), "HH:mm", { locale: fr })}
        </span>
        {appointment.isGoogleEvent && (
          <div className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            <Badge variant="outline" className="text-xs px-1 py-0">
              Google
            </Badge>
          </div>
        )}
      </div>
      
      <div className="font-medium text-sm mb-1">
        {appointment.isGoogleEvent ? (
          appointment.summary || 'Événement Google'
        ) : (
          appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Patient inconnu'
        )}
      </div>
      
      {appointment.reason && (
        <div className="text-xs opacity-75 mb-1">{appointment.reason}</div>
      )}
      
      {appointment.patient && (
        <div className="text-xs opacity-75">
          Patient identifié: {appointment.patient.firstName} {appointment.patient.lastName}
        </div>
      )}
      
      {appointment.isGoogleEvent && appointment.patient && (
        <div className="mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invoices/new?patientId=${appointment.patient.id}&date=${appointment.date}`);
            }}
          >
            Facturer
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <ScheduleHeader />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              ← Semaine précédente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              Semaine suivante →
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isGoogleConnected && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {googleEvents.length} événements Google
              </Badge>
            )}
            <Badge variant="outline">
              Semaine du {format(weekStart, "d MMM", { locale: fr })} au {format(weekEnd, "d MMM yyyy", { locale: fr })}
            </Badge>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-8 gap-0 border-b">
                <div className="p-3 bg-muted font-medium text-sm">Heure</div>
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-3 text-center border-l font-medium text-sm",
                      isToday(day) && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <div>{format(day, "EEE", { locale: fr })}</div>
                    <div className={cn(
                      "text-lg",
                      isToday(day) && "font-bold"
                    )}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              {timeSlots.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-0 border-b min-h-[80px]">
                  <div className="p-2 bg-muted text-sm font-medium text-center">
                    {hour}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayAppointments = combinedAppointments.filter(apt => {
                      const aptDate = parseISO(apt.date);
                      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
                    });

                    return (
                      <div key={`${day.toISOString()}-${hour}`} className="p-1 border-l min-h-[80px]">
                        {dayAppointments.map(renderAppointmentCard)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Mobile/Tablet view */}
        <div className="lg:hidden space-y-4">
          {weekDays.map((day) => {
            const dayAppointments = combinedAppointments.filter(apt => {
              return isSameDay(parseISO(apt.date), day);
            });

            return (
              <Card key={day.toISOString()}>
                <CardHeader className={cn(
                  "pb-3",
                  isToday(day) && "bg-blue-50"
                )}>
                  <CardTitle className={cn(
                    "text-lg flex items-center justify-between",
                    isToday(day) && "text-blue-700"
                  )}>
                    <span>
                      {format(day, "EEEE d MMMM", { locale: fr })}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {dayAppointments.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayAppointments.length > 0 ? (
                    dayAppointments.map(renderAppointmentCard)
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun rendez-vous
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Floating action button - responsive */}
        <Button
          onClick={() => navigate("/appointments/new")}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 md:w-16 md:h-16 shadow-lg hover:shadow-xl transition-shadow z-50"
        >
          <Plus className="h-6 w-6 md:h-8 md:w-8" />
        </Button>
      </div>
    </Layout>
  );
};

export default SchedulePage;
