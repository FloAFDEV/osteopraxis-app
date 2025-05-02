
// Importations existantes restent inchangées
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Clock, FileText, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { Appointment, Patient, AppointmentStatus } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SchedulePage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [view, setView] = useState<"day" | "week">("week");
  const [actionInProgress, setActionInProgress] = useState<{id: number, action: 'cancel' | 'delete'} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsData, patientsData] = await Promise.all([
          api.getAppointments(),
          api.getPatients(),
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    // Calculate current week days
    const start = startOfWeek(selectedDate, {
      weekStartsOn: 1,
    }); // Week starts on Monday
    const end = endOfWeek(selectedDate, {
      weekStartsOn: 1,
    });
    const days = eachDayOfInterval({ start, end });
    setCurrentWeek(days);
  }, [selectedDate]);

  const getPatientById = (patientId: number) => {
    return patients.find((patient) => patient.id === patientId);
  };

  const getDayAppointments = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.date);
      return isSameDay(appointmentDate, date) && appointment.status === "SCHEDULED";
    }).sort((a, b) => {
      const timeA = parseISO(a.date);
      const timeB = parseISO(b.date);
      return timeA.getTime() - timeB.getTime();
    });
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setActionInProgress({id: appointmentId, action: 'cancel'});
      await api.cancelAppointment(appointmentId);
      toast.success("Rendez-vous annulé avec succès");
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: "CANCELED" as AppointmentStatus } 
          : appointment
      );
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Impossible d'annuler le rendez-vous");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      setActionInProgress({id: appointmentId, action: 'delete'});
      await api.deleteAppointment(appointmentId);
      toast.success("Rendez-vous supprimé avec succès");
      
      // Filtrer le rendez-vous supprimé de la liste
      const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Impossible de supprimer le rendez-vous");
    } finally {
      setActionInProgress(null);
    }
  };

  const navigateToPreviousWeek = () => {
    setSelectedDate((prevDate) => addDays(prevDate, -7));
  };

  const navigateToNextWeek = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 7));
  };

  const navigateToPreviousDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, -1));
  };

  const navigateToNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
  };

  const navigateToToday = () => {
    setSelectedDate(new Date());
  };
  
  const handleDayHeaderClick = (date: Date) => {
    // Redirige vers la création de rendez-vous avec la date pré-remplie
    const dateStr = format(date, "yyyy-MM-dd");
    navigate(`/appointments/new?date=${dateStr}`);
  };

  return <Layout>
      <div className="flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-amber-500" />
            Planning
          </h1>
          
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={v => setView(v as "day" | "week")} className="mr-2">
              <TabsList>
                <TabsTrigger value="day">Jour</TabsTrigger>
                <TabsTrigger value="week">Semaine</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={navigateToToday}>
              Aujourd'hui
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMMM yyyy", {
                    locale: fr,
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du planning...</p>
            </div>
          </div>
        ) : (
          <Tabs value={view} defaultValue={view}>
            <TabsContent value="day">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={navigateToPreviousDay}>
                      <ChevronLeft className="h-4 w-4" />
                      Jour précédent
                    </Button>
                    <Button variant="ghost" size="sm" onClick={navigateToToday}>
                      Aujourd'hui
                    </Button>
                    <Button variant="ghost" size="sm" onClick={navigateToNextDay}>
                      Jour suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-medium capitalize mt-2 sm:mt-0">
                    {format(selectedDate, "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </h2>
                </div>
                <DaySchedule
                  date={selectedDate}
                  appointments={getDayAppointments(selectedDate)}
                  getPatientById={getPatientById}
                  onCancelAppointment={handleCancelAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  actionInProgress={actionInProgress}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="week">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={navigateToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                    Semaine précédente
                  </Button>
                  
                  <h2 className="text-xl font-medium">
                    Semaine du {format(currentWeek[0], "d MMMM", {
                      locale: fr,
                    })} au {format(currentWeek[6], "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </h2>
                  
                  <Button variant="ghost" size="sm" onClick={navigateToNextWeek}>
                    Semaine suivante
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {currentWeek.map((day) => (
                    <div key={day.toString()} className="flex flex-col">
                      <button
                        type="button"
                        className={cn(
                          // Amélioration du contraste en mode sombre pour le bouton actif
                          "p-2 text-center capitalize mb-2 rounded-md transition-colors hover:bg-blue-100 active:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-primary w-full",
                          isSameDay(day, new Date())
                            ? "bg-amber-600 text-amber-100 dark:bg-amber-500 dark:text-amber-900"
                            : "bg-muted dark:bg-muted"
                        )}
                        onClick={() => handleDayHeaderClick(day)}
                        tabIndex={0}
                        title={`Ajouter un rendez-vous le ${format(day, "d MMMM yyyy", { locale: fr })}`}
                        aria-label={`Ajouter un rendez-vous le ${format(day, "d MMMM yyyy", { locale: fr })}`}
                      >
                        <div className="font-medium">
                          {format(day, "EEEE", {
                            locale: fr,
                          })}
                        </div>
                        <div className="text-sm">
                          {format(day, "d MMM", {
                            locale: fr,
                          })}
                        </div>
                        <span className="sr-only">
                          Ajouter un rendez-vous
                        </span>
                      </button>
                      
                      {getDayAppointments(day).length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-4 text-center border border-dashed rounded-md">
                          <p className="text-sm text-muted-foreground">Aucun rendez-vous</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {getDayAppointments(day).map((appointment) => {
                            const patient = getPatientById(appointment.patientId);
                            const appointmentTime = format(parseISO(appointment.date), "HH:mm");
                            const isProcessingAction = actionInProgress?.id === appointment.id;
                            
                            return (
                              <Card key={appointment.id} className="hover-scale">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge className="bg-blue-500">{appointmentTime}</Badge>
                                    
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" // Changed from "xs" to "sm"
                                        className="h-6 px-2 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        disabled={isProcessingAction}
                                        title="Annuler ce rendez-vous"
                                      >
                                        {actionInProgress?.id === appointment.id && actionInProgress.action === 'cancel' ? (
                                          <span className="animate-spin">⏳</span>
                                        ) : "Annuler"}
                                      </Button>
                                      
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 rounded-full text-destructive hover:bg-destructive/10"
                                            disabled={isProcessingAction}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Supprimer le rendez-vous</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)} className="bg-destructive">
                                              {actionInProgress?.id === appointment.id && actionInProgress.action === 'delete' ? (
                                                <span className="animate-spin mr-2">⏳</span>
                                              ) : null}
                                              Supprimer
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                  
                                  <Link to={`/appointments/${appointment.id}/edit`} className="block group">
                                    <h3 className="font-medium group-hover:text-primary truncate">
                                      {patient
                                        ? `${patient.firstName} ${patient.lastName}`
                                        : `Patient #${appointment.patientId}`}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {appointment.reason}
                                    </p>
                                  </Link>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>;
};

interface DayScheduleProps {
  date: Date;
  appointments: Appointment[];
  getPatientById: (id: number) => Patient | undefined;
  onCancelAppointment: (id: number) => void;
  onDeleteAppointment: (id: number) => void;
  actionInProgress: {id: number, action: 'cancel' | 'delete'} | null;
}

const DaySchedule = ({
  date,
  appointments,
  getPatientById,
  onCancelAppointment,
  onDeleteAppointment,
  actionInProgress
}: DayScheduleProps) => {
  // Generate time slots for the day (8am to 8pm)
  const timeSlots = Array.from({
    length: 25
  }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Starting from 8 AM
    const minute = i % 2 * 30; // 0 or 30 minutes
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });
  
  // Ne pas afficher les créneaux après 20h
  const displayTimeSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour < 20;
  });

  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return appointments.find(appointment => {
      const appointmentTime = format(parseISO(appointment.date), "HH:mm");
      return appointmentTime === timeSlot;
    });
  };

  return <div className="rounded-md border">
      {displayTimeSlots.map(timeSlot => {
      const appointment = getAppointmentForTimeSlot(timeSlot);
      const isCurrentTime = format(new Date(), "HH:mm") === timeSlot && isSameDay(date, new Date());
      const isProcessingAction = appointment && actionInProgress?.id === appointment.id;
      
      return <div key={timeSlot} className={cn("flex border-b last:border-b-0 transition-colors", isCurrentTime ? "bg-primary/5" : "hover:bg-muted/50")}>
            <div className="w-20 p-3 border-r bg-muted/20 flex items-center justify-center">
              <span className={cn("text-sm font-medium", isCurrentTime ? "text-primary" : "text-muted-foreground")}>
                {timeSlot}
              </span>
            </div>
            
            <div className="flex-1 p-3">
              {appointment ? <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <Link to={`/patients/${appointment.patientId}`} className="font-medium hover:text-primary">
                        {getPatientById(appointment.patientId)?.firstName || ""} {getPatientById(appointment.patientId)?.lastName || `Patient #${appointment.patientId}`}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {appointment.reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/invoices/new?appointmentId=${appointment.id}`} aria-label="Créer une facture pour ce rendez-vous">
                        <FileText className="h-4 w-4 mr-1" />
                        Facture
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/appointments/${appointment.id}/edit`} aria-label="Voir les détails du rendez-vous">
                        Détails
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => onCancelAppointment(appointment.id)}
                      disabled={isProcessingAction}
                      aria-label="Annuler ce rendez-vous"
                    >
                      {isProcessingAction && actionInProgress?.action === 'cancel' ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-1">⏳</span>
                          Annulation...
                        </span>
                      ) : "Annuler"}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          disabled={isProcessingAction}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le rendez-vous</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteAppointment(appointment.id)} className="bg-destructive">
                            {isProcessingAction && actionInProgress?.action === 'delete' ? (
                              <span className="animate-spin mr-2">⏳</span>
                            ) : null}
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div> : <Link 
                  to={`/appointments/new?date=${format(date, 'yyyy-MM-dd')}&time=${timeSlot}`} 
                  className="flex h-full items-center justify-center text-sm text-muted-foreground hover:text-primary"
                  aria-label={`Créer un rendez-vous le ${format(date, 'd MMMM yyyy', { locale: fr })} à ${timeSlot}`}
                >
                  <span className="text-center">Disponible</span>
                </Link>}
            </div>
          </div>;
    })}
    </div>;
};

export default SchedulePage;

