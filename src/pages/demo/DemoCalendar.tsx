import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  User,
  MapPin
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Appointment } from "@/types";

export default function DemoCalendar() {
  const { demoData } = useDemo();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Génération de la semaine
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Heures de travail (8h-18h)
  const workingHours = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Filtrer les rendez-vous de la semaine
  const weekAppointments = demoData.appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return weekDays.some(day => isSameDay(appointmentDate, day));
  });

  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    return weekAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const appointmentTime = format(appointmentDate, 'HH:mm');
      return isSameDay(appointmentDate, day) && appointmentTime === time;
    });
  };

  const getPatientName = (patientId: number) => {
    const patient = demoData.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planifié';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELED':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <p className="text-muted-foreground">
            Planifiez et gérez vos rendez-vous
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau RDV
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold">
                Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
              Aujourd'hui
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 font-medium bg-muted/50">Heure</div>
                {weekDays.map((day, index) => (
                  <div key={index} className="p-3 text-center font-medium bg-muted/50 border-l">
                    <div className={`${isToday(day) ? 'text-primary font-bold' : ''}`}>
                      {format(day, 'EEEE d', { locale: fr })}
                    </div>
                    {isToday(day) && (
                      <Badge variant="default" className="mt-1 text-xs">Aujourd'hui</Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {workingHours.map((time, timeIndex) => (
                <div key={timeIndex} className="grid grid-cols-8 border-b">
                  <div className="p-2 text-sm text-muted-foreground bg-muted/20 font-medium">
                    {time}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const appointments = getAppointmentsForDayAndTime(day, time);
                    
                    return (
                      <div key={dayIndex} className="p-1 min-h-[60px] border-l relative hover:bg-muted/20 transition-colors">
                        {appointments.map((appointment, appIndex) => (
                          <div
                            key={appIndex}
                            className={`
                              absolute inset-1 p-2 rounded border cursor-pointer
                              ${getStatusColor(appointment.status)}
                              hover:shadow-sm transition-shadow
                            `}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <div className="text-xs font-medium truncate">
                              {getPatientName(appointment.patientId)}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {appointment.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails du rendez-vous</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {getPatientName(selectedAppointment.patientId)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(selectedAppointment.date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{demoData.cabinets[0].name}</span>
              </div>

              <div>
                <strong>Motif:</strong>
                <p className="text-muted-foreground mt-1">{selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="text-muted-foreground mt-1">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <strong>Statut:</strong>
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusText(selectedAppointment.status)}
                </Badge>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline">Modifier</Button>
                {selectedAppointment.status === 'SCHEDULED' && (
                  <Button variant="outline">Terminer</Button>
                )}
                <Button>Voir le patient</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {weekAppointments.filter(a => a.status === 'SCHEDULED').length}
                </div>
                <p className="text-xs text-muted-foreground">RDV planifiés cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {weekAppointments.filter(a => a.status === 'COMPLETED').length}
                </div>
                <p className="text-xs text-muted-foreground">RDV terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(weekAppointments.map(a => a.patientId)).size}
                </div>
                <p className="text-xs text-muted-foreground">Patients différents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}