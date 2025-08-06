import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import { SmartSkeleton } from "@/components/ui/skeleton-loaders";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/ui/layout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { useOptimizedCache } from "@/hooks/useOptimizedCache";
import { MonthlyScheduleView } from "@/components/schedule/MonthlyScheduleView";
import { AppointmentModal } from "@/components/appointment-modal";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, FileText, Trash2, User, X, ExternalLink, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
// Service demo supprimé
const SchedulePage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [showGoogleEvents, setShowGoogleEvents] = useState(true);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentModalDate, setAppointmentModalDate] = useState<Date | undefined>();
  const [actionInProgress, setActionInProgress] = useState<{
    id: number;
    action: "cancel" | "delete";
  } | null>(null);
  const navigate = useNavigate();
  const {
    events: googleEvents,
    isConnected: isGoogleConnected
  } = useGoogleCalendar();
  // Mode démo supprimé

  // Utiliser le hook pour la mise à jour automatique des statuts
  useAppointmentStatusUpdate({
    appointments,
    onAppointmentsUpdate: setAppointments
  });

  // Utiliser le cache optimisé pour les données
  const {
    data: cachedAppointments,
    loading: appointmentsLoading,
    invalidate: invalidateAppointments
  } = useOptimizedCache('appointments', () => {
    // Mode démo supprimé
    return api.getAppointments();
  }, {
    ttl: 2 * 60 * 1000
  } // 2 minutes pour les rendez-vous
  );
  const {
    data: cachedPatients,
    loading: patientsLoading,
    invalidate: invalidatePatients
  } = useOptimizedCache('patients', () => {
    // Mode démo supprimé
    return api.getPatients();
  }, {
    ttl: 10 * 60 * 1000
  } // 10 minutes pour les patients (changent moins souvent)
  );

  // États locaux mis à jour depuis le cache
  useEffect(() => {
    if (cachedAppointments) {
      setAppointments(cachedAppointments);
    }
  }, [cachedAppointments]);
  useEffect(() => {
    if (cachedPatients) {
      setPatients(cachedPatients);
    }
  }, [cachedPatients]);

  // Loading state basé sur le cache
  const isLoading = appointmentsLoading || patientsLoading;

  // useEffect for calculating week remains the same
  useEffect(() => {
    const start = startOfWeek(selectedDate, {
      weekStartsOn: 1
    });
    const end = endOfWeek(selectedDate, {
      weekStartsOn: 1
    });
    const days = eachDayOfInterval({
      start,
      end
    });
    setCurrentWeek(days);
  }, [selectedDate]);

  // Helper functions (getPatientById, getDayAppointments) remain the same
  const getPatientById = (patientId: number) => {
    const patient = patients.find(patient => patient.id === patientId);
    if (!patient) {
      console.log(`Patient non trouvé pour ID ${patientId}. Patients disponibles:`, patients.length);
      console.log('Premier patient exemple:', patients[0]);
    }
    return patient;
  };
  const getDayAppointments = (date: Date) => {
    return appointments.filter(appointment => {
      if (!appointment?.date) return false;
      try {
        const appointmentDate = parseISO(appointment.date);
        return isSameDay(appointmentDate, date) && (appointment.status === "SCHEDULED" || appointment.status === "COMPLETED");
      } catch {
        return false;
      }
    }).sort((a, b) => {
      try {
        const timeA = parseISO(a.date);
        const timeB = parseISO(b.date);
        return timeA.getTime() - timeB.getTime();
      } catch {
        return 0;
      }
    });
  };
  const getDayGoogleEvents = (date: Date) => {
    if (!isGoogleConnected || !googleEvents || !showGoogleEvents) return [];
    return googleEvents.filter(event => {
      if (!event?.start_time) return false;
      try {
        const eventDate = parseISO(event.start_time);
        return isSameDay(eventDate, date);
      } catch {
        return false;
      }
    }).sort((a, b) => {
      try {
        const timeA = parseISO(a.start_time);
        const timeB = parseISO(b.start_time);
        return timeA.getTime() - timeB.getTime();
      } catch {
        return 0;
      }
    });
  };

  // Action handlers avec invalidation du cache
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setActionInProgress({
        id: appointmentId,
        action: "cancel"
      });
      await api.cancelAppointment(appointmentId);
      toast.success("Séance annulée avec succès");

      // Mettre à jour localement et invalider le cache
      const updatedAppointments = appointments.map(appointment => appointment.id === appointmentId ? {
        ...appointment,
        status: "CANCELED" as AppointmentStatus
      } : appointment);
      setAppointments(updatedAppointments);
      invalidateAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Impossible d'annuler la séance");
    } finally {
      setActionInProgress(null);
    }
  };
  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      setActionInProgress({
        id: appointmentId,
        action: "delete"
      });
      await api.deleteAppointment(appointmentId);
      toast.success("Séance supprimé avec succès");

      // Mettre à jour localement et invalider le cache
      const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
      setAppointments(updatedAppointments);
      invalidateAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Impossible de supprimer le Séance");
    } finally {
      setActionInProgress(null);
    }
  };

  // Navigation functions remain the same
  const navigateToPreviousWeek = () => setSelectedDate(prevDate => addDays(prevDate, -7));
  const navigateToNextWeek = () => setSelectedDate(prevDate => addDays(prevDate, 7));
  const navigateToPreviousDay = () => setSelectedDate(prevDate => addDays(prevDate, -1));
  const navigateToNextDay = () => setSelectedDate(prevDate => addDays(prevDate, 1));
  const navigateToToday = () => setSelectedDate(new Date());
  const handleDayHeaderClick = (date: Date) => {
    setAppointmentModalDate(date);
    setAppointmentModalOpen(true);
  };
  const handleAppointmentSuccess = () => {
    // Invalider le cache pour recharger les données
    invalidateAppointments();
    invalidatePatients();
  };

  // --- JSX Structure ---
  return <Layout>
			{/* Bouton de retour */}
			<div className="relative z-10">
				<div className="flex items-center gap-2 mb-2">
					<Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour
					</Button>
				</div>
			</div>

			{/* Contenu principal */}
			<div className="flex flex-col min-h-screen">
				{/* Header type Appointment */}
				<div className="flex-shrink-0 p-4 sm:p-6 lg:p-8">
					<ScheduleHeader />
				</div>
				
				<div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
				{/* Header avec contrôles Google Calendar */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Clock className="h-8 w-8 text-amber-500" />
						Planning
					</h1>
					<div className="flex items-center gap-2 flex-wrap">
						{isGoogleConnected && <div className="flex items-center gap-2">
								<div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									Google Calendar
								</div>
								<Button variant="outline" size="sm" onClick={() => setShowGoogleEvents(!showGoogleEvents)} className={cn("text-xs", showGoogleEvents ? "bg-blue-50 text-blue-700" : "text-gray-500")}>
									{showGoogleEvents ? "Masquer Google" : "Afficher Google"}
								</Button>
							</div>}
						<Tabs value={view} onValueChange={v => setView(v as "day" | "week" | "month")} className="mr-2">
							<TabsList>
								<TabsTrigger value="day">Jour</TabsTrigger>
								<TabsTrigger value="week">Semaine</TabsTrigger>
								<TabsTrigger value="month">Mois</TabsTrigger>
							</TabsList>
						</Tabs>
						
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" size="sm" className="ml-auto">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{selectedDate ? format(selectedDate, "MMMM yyyy", {
                    locale: fr
                  }) : "Date invalide"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="end">
								<Calendar mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} initialFocus className={cn("p-3 pointer-events-auto")} />
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* Loading state avec cache */}
				{isLoading && !appointments.length ? <SmartSkeleton type="schedule" /> : <Tabs value={view} defaultValue={view}>
						{/* TabsContent value="day" avec Google Events */}
						<TabsContent value="day">
							<div className="space-y-4">
								<div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
									<div className="flex gap-2">
										<Button variant="ghost" size="sm" onClick={navigateToPreviousDay}>
											<ChevronLeft className="h-4 w-4" />{" "}
											Jour précédent
										</Button>
										<Button variant="ghost" size="sm" onClick={navigateToToday}>
											Aujourd'hui
										</Button>
										<Button variant="ghost" size="sm" onClick={navigateToNextDay}>
											Jour suivant{" "}
											<ChevronRight className="h-4 w-4 ml-1" />
										</Button>
									</div>
									<h2 className="text-xl font-medium capitalize mt-2 sm:mt-0">
										{selectedDate ? format(selectedDate, "EEEE d MMMM yyyy", {
                    locale: fr
                  }) : "Date invalide"}
									</h2>
								</div>
								<DaySchedule date={selectedDate} appointments={getDayAppointments(selectedDate)} googleEvents={getDayGoogleEvents(selectedDate)} getPatientById={getPatientById} onCancelAppointment={handleCancelAppointment} onDeleteAppointment={handleDeleteAppointment} actionInProgress={actionInProgress} />
							</div>
						</TabsContent>

						{/* TabsContent value="week" avec Google Events améliorés */}
						<TabsContent value="week">
							<div className="space-y-4">
								{/* Week navigation remains the same */}
								<div className="flex items-center justify-between mb-4">
									<Button variant="ghost" size="sm" onClick={navigateToPreviousWeek}>
										<ChevronLeft className="h-4 w-4" />{" "}
										Semaine précédente
									</Button>
									<h2 className="text-xl font-medium">
										Semaine du{" "}
										{currentWeek[0] ? format(currentWeek[0], "d MMMM", {
                    locale: fr
                  }) : "..."}{" "}
										au{" "}
										{currentWeek[6] ? format(currentWeek[6], "d MMMM yyyy", {
                    locale: fr
                  }) : "..."}
									</h2>
									<Button variant="ghost" size="sm" onClick={navigateToNextWeek}>
										Semaine suivante{" "}
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>

								{/* Grid for the week */}
								<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
									{currentWeek.map(day => {
                  const dayAppointments = getDayAppointments(day);
                  const dayGoogleEvents = getDayGoogleEvents(day);
                  const hasAnyEvents = dayAppointments.length > 0 || dayGoogleEvents.length > 0;
                  return <div key={day.toString()} className="flex flex-col">
												{/* Day header button remains the same */}
												<button type="button" className={cn("p-2 text-center capitalize mb-2 rounded-md transition-colors hover:bg-blue-100 active:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-primary w-full", isSameDay(day, new Date()) ? "bg-amber-600 text-amber-100 dark:bg-amber-500 dark:text-amber-900" : "bg-muted dark:bg-muted")} onClick={() => handleDayHeaderClick(day)} tabIndex={0} title={`Ajouter un Séance le ${format(day, "d MMMM yyyy", {
                      locale: fr
                    })}`} aria-label={`Ajouter un Séance le ${format(day, "d MMMM yyyy", {
                      locale: fr
                    })}`}>
													<div className="font-medium">
														{format(day, "EEEE", {
                          locale: fr
                        })}
													</div>
													<div className="text-sm">
														{format(day, "d MMM", {
                          locale: fr
                        })}
													</div>
													<span className="sr-only">
														Ajouter un Séance
													</span>
												</button>

												{/* Events list or empty state */}
												{!hasAnyEvents ? <div className="flex-1 flex items-center justify-center p-4 text-center border border-dashed rounded-md">
														<p className="text-sm text-muted-foreground">
															Aucune séance
														</p>
													</div> : <div className="space-y-2">
														{/* Google Calendar Events avec correspondance patient */}
														{dayGoogleEvents.map(event => {
                        let eventStartTime = "??:??";
                        try {
                          if (event?.start_time) {
                            eventStartTime = format(parseISO(event.start_time), "HH:mm");
                          }
                        } catch {
                          eventStartTime = "??:??";
                        }
                        return <Card key={event.id} className="hover-scale flex flex-col border-l-4 border-l-blue-500 bg-blue-50/50">
																	<CardContent className="p-3 flex-grow">
																		<div className="flex items-center justify-between mb-2">
																			<Badge className="bg-blue-500 text-xs">
																				{eventStartTime}
																			</Badge>
																			<div className="flex gap-1">
																				{event.is_doctolib && <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
																						Doctolib
																					</Badge>}
																				<Badge variant="outline" className="text-blue-700 border-blue-300 text-xs">
																					Google
																				</Badge>
																			</div>
																		</div>
																		<div className="mb-2">
																			<h3 className="font-medium text-blue-900 truncate text-sm">
																				{event.summary}
																			</h3>
																			{event.location && <p className="text-xs text-blue-700 truncate">
																					📍 {event.location}
																				</p>}
																			{event.matched_patient_name && <div className="flex items-center gap-1 mt-1">
																					<Users className="h-3 w-3 text-green-600" />
																					<span className="text-xs text-green-700 font-medium">
																						{event.matched_patient_name}
																					</span>
																				</div>}
																		</div>
																	</CardContent>
																	<div className="px-3 pb-2 flex justify-between items-center">
																		<p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
																			Événement externe (lecture seule)
																		</p>
																		{event.matched_patient_id && <Link to={`/patients/${event.matched_patient_id}`} className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1">
																				<ExternalLink className="h-3 w-3" />
																				Fiche patient
																			</Link>}
																	</div>
																</Card>;
                      })}

														{/* Internal Appointments - keep existing code */}
														{dayAppointments.map(appointment => {
                        const patient = getPatientById(appointment.patientId);
                        let appointmentTime = "??:??";
                        try {
                          if (appointment?.date) {
                            appointmentTime = format(parseISO(appointment.date), "HH:mm");
                          }
                        } catch {
                          appointmentTime = "??:??";
                        }
                        const isProcessingAction = actionInProgress?.id === appointment.id;
                        return <Card key={appointment.id} className="hover-scale flex flex-col">
																	<CardContent className="p-3 flex-grow">
																		{/* Top section: Time Badge */}
																		<div className="flex items-center justify-between mb-2">
																			<Badge className="bg-blue-500">
																				{appointmentTime}
																			</Badge>
																			{appointment.status === "COMPLETED" && <Badge className="bg-amber-500">
																					Terminé
																				</Badge>}
																		</div>
																		{/* Middle section: Link to patient/reason */}
																		<Link to={`/appointments/${appointment.id}/edit`} className="block group mb-3">
																			<h3 className="font-medium group-hover:text-primary truncate">
																				{patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${appointment.patientId}`}
																			</h3>
																			<p className="text-sm text-muted-foreground truncate">
																				{appointment.reason}
																			</p>
																		</Link>
																	</CardContent>
																	{/* Bottom section: Action Buttons */}
																	<div className="flex flex-col sm:flex-row items-center justify-end gap-2 p-2 border-t bg-muted/30">
																		{/* Cancel Button */}
																		<Button variant="ghost" size="sm" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 h-8 px-3 flex items-center justify-center space-x-1" onClick={() => handleCancelAppointment(appointment.id)} disabled={isProcessingAction || appointment.status === "COMPLETED"} title="Annuler cette séance">
																			{actionInProgress?.id === appointment.id && actionInProgress.action === "cancel" && <span className="animate-spin text-base">
																						⏳
																					</span>}
																			<X className="w-4 h-4" />
																			<span className="hidden sm:inline">
																				Annuler
																			</span>
																		</Button>

																		{/* Delete Button Trigger */}
																		<AlertDialog>
																			<AlertDialogTrigger asChild>
																				<Button variant="ghost" size="sm" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 h-8 px-3 flex items-center justify-center" disabled={isProcessingAction} title="Supprimer cette séance">
																					<Trash2 className="h-4 w-4 sm:mr-1" />
																				</Button>
																			</AlertDialogTrigger>
																			<AlertDialogContent>
																				<AlertDialogHeader>
																					<AlertDialogTitle>
																						Supprimer
																						le
																						Séance
																					</AlertDialogTitle>
																					<AlertDialogDescription>
																						Êtes-vous
																						sûr
																						de
																						vouloir
																						supprimer
																						définitivement
																						cette
																						séance
																						?
																					</AlertDialogDescription>
																				</AlertDialogHeader>
																				<AlertDialogFooter>
																					<AlertDialogCancel>
																						Annuler
																					</AlertDialogCancel>
																					<AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)} className="bg-destructive hover:bg-destructive/90">
																						{actionInProgress?.id === appointment.id && actionInProgress.action === "delete" ? <span className="animate-spin mr-2">
																								⏳
																							</span> : null}
																						Supprimer
																					</AlertDialogAction>
																				</AlertDialogFooter>
																			</AlertDialogContent>
																		</AlertDialog>
																	</div>
																</Card>;
                      })}
													</div>}
											</div>;
                })}
								</div>
							</div>
						</TabsContent>

						{/* Vue mensuelle */}
						<TabsContent value="month">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<AppointmentModal patients={patients} selectedDate={appointmentModalDate} isOpen={appointmentModalOpen} onOpenChange={setAppointmentModalOpen} onSuccess={handleAppointmentSuccess} />
								</div>
							</div>
							<MonthlyScheduleView appointments={appointments} patients={patients} selectedDate={selectedDate} onDateChange={setSelectedDate} onDayClick={handleDayHeaderClick} />
						</TabsContent>
					</Tabs>}
				</div>
			</div>

		</Layout>;
};

// DaySchedule Component avec Google Events
interface DayScheduleProps {
  date: Date;
  appointments: Appointment[];
  googleEvents: any[];
  getPatientById: (id: number) => Patient | undefined;
  onCancelAppointment: (id: number) => void;
  onDeleteAppointment: (id: number) => void;
  actionInProgress: {
    id: number;
    action: "cancel" | "delete";
  } | null;
}
const DaySchedule = ({
  date,
  appointments,
  googleEvents,
  getPatientById,
  onCancelAppointment,
  onDeleteAppointment,
  actionInProgress
}: DayScheduleProps) => {
  // Time slot generation logic remains the same
  const timeSlots = Array.from({
    length: 25
  }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 * 30;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });
  const displayTimeSlots = timeSlots.filter(slot => parseInt(slot.split(":")[0]) < 20);
  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return appointments.find(appointment => {
      try {
        if (!appointment?.date) return false;
        return format(parseISO(appointment.date), "HH:mm") === timeSlot;
      } catch {
        return false;
      }
    });
  };
  const getGoogleEventForTimeSlot = (timeSlot: string) => {
    return googleEvents.find(event => {
      try {
        if (!event?.start_time) return false;
        return format(parseISO(event.start_time), "HH:mm") === timeSlot;
      } catch {
        return false;
      }
    });
  };
  return <div className="rounded-md border">
			{displayTimeSlots.map(timeSlot => {
      const appointment = getAppointmentForTimeSlot(timeSlot);
      const googleEvent = getGoogleEventForTimeSlot(timeSlot);
      const isCurrentTime = (() => {
        try {
          const now = new Date();
          return format(now, "HH:mm") === timeSlot && isSameDay(date, now);
        } catch {
          return false;
        }
      })();
      const isProcessingAction = appointment && actionInProgress?.id === appointment.id;
      const isCompleted = appointment?.status === "COMPLETED";
      return <div key={timeSlot} className={cn("flex border-b last:border-b-0 transition-colors", isCurrentTime ? "bg-primary/5" : "hover:bg-muted/50")}>
						{/* Time slot display */}
						<div className="w-20 p-3 border-r bg-muted/20 flex items-center justify-center shrink-0">
							<span className={cn("text-sm font-medium", isCurrentTime ? "text-primary" : "text-muted-foreground")}>
								{timeSlot}
							</span>
						</div>

						{/* Appointment details or Google event or link */}
						<div className="flex-1 p-3 min-w-0">
							{googleEvent ? <div className="flex flex-col lg:flex-row items-start justify-between gap-2 border-l-4 border-l-blue-500 bg-blue-50/50 p-3 rounded">
									<div className="flex-grow min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<Badge className="bg-blue-500 text-white text-xs">
												Google
											</Badge>
											{googleEvent.is_doctolib && <Badge className="bg-green-500 text-white text-xs">
													Doctolib
												</Badge>}
											<h3 className="font-medium text-blue-900 truncate">
												{googleEvent.summary}
											</h3>
										</div>
										{googleEvent.location && <p className="text-sm text-blue-700 ml-2 truncate">
												📍 {googleEvent.location}
											</p>}
										{googleEvent.matched_patient_name && <div className="flex items-center gap-1 mt-1 ml-2">
												<Users className="h-4 w-4 text-green-600" />
												<span className="text-sm text-green-700 font-medium">
													{googleEvent.matched_patient_name}
												</span>
												{googleEvent.matched_patient_id && <Link to={`/patients/${googleEvent.matched_patient_id}`} className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1 ml-2">
														<ExternalLink className="h-4 w-4" />
														Voir la fiche
													</Link>}
											</div>}
										<p className="text-xs text-blue-600 mt-1">
											Événement externe (lecture seule)
										</p>
									</div>
								</div> : appointment ? <div className="flex flex-col lg:flex-row items-start justify-between gap-2">
									{/* Appointment Info */}
									<div className="flex-grow min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<User className="h-4 w-4 text-primary shrink-0" />
											<Link to={`/patients/${appointment.patientId}`} className="font-medium hover:text-primary truncate">
												{getPatientById(appointment.patientId)?.firstName || ""}{" "}
												{getPatientById(appointment.patientId)?.lastName || `Patient #${appointment.patientId}`}
											</Link>
											{isCompleted && <Badge className="bg-amber-500 text-white">
													Terminé
												</Badge>}
										</div>
										<p className="text-sm text-muted-foreground ml-6 truncate">
											{appointment.reason}
										</p>
									</div>
									{/* Action Buttons - Made responsive */}
									<div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto shrink-0">
										{/* Link Buttons */}
										<Button variant="outline" size="sm" asChild className="flex-grow lg:flex-grow-0">
											<Link to={`/invoices/new?appointmentId=${appointment.id}`} aria-label="Créer une Note d'honoraire pour ce Séance">
												<FileText className="h-4 w-4 mr-1" />{" "}
												Note d'honoraire
											</Link>
										</Button>
										<Button variant="outline" size="sm" asChild className="flex-grow lg:flex-grow-0">
											<Link to={`/appointments/${appointment.id}/edit`} aria-label="Voir les détails de la séance">
												Détails
											</Link>
										</Button>
										{/* Destructive Buttons */}
										<Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-grow lg:flex-grow-0" onClick={() => onCancelAppointment(appointment.id)} disabled={isProcessingAction || isCompleted} aria-label="Annuler cette séance">
											{isProcessingAction && actionInProgress?.action === "cancel" ? <span className="flex items-center">
														<span className="animate-spin mr-1">
															⏳
														</span>
														Annulation...
													</span> : <>
														<X className="h-4 w-4 mr-1" />{" "}
														Annuler{" "}
													</>}
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-grow lg:flex-grow-0" disabled={isProcessingAction}>
													<Trash2 className="h-4 w-4 mr-1" />{" "}
													Supprimer
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Supprimer le Séance
													</AlertDialogTitle>
													<AlertDialogDescription>
														Êtes-vous sûr de vouloir
														supprimer définitivement
														ce Séance ?
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Annuler
													</AlertDialogCancel>
													<AlertDialogAction onClick={() => onDeleteAppointment(appointment.id)} className="bg-destructive hover:bg-destructive/90">
														{isProcessingAction && actionInProgress?.action === "delete" ? <span className="animate-spin mr-2">
																⏳
															</span> : null}
														Supprimer
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div> : <Link to={`/appointments/new?date=${format(date, "yyyy-MM-dd")}&time=${timeSlot}`} className="flex h-full items-center justify-center text-sm text-muted-foreground hover:text-primary" aria-label={`Créer un Séance le ${format(date, "d MMMM yyyy", {
            locale: fr
          })} à ${timeSlot}`}>
									<span className="text-center">
										Disponible
									</span>
								</Link>}
						</div>
					</div>;
    })}
		</div>;
};
export default SchedulePage;