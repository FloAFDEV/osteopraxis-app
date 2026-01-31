import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import { SmartSkeleton } from "@/components/ui/skeleton-loaders";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/ui/layout";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOptimizedCache } from "@/hooks/useOptimizedCache";
import { MonthlyScheduleView } from "@/components/schedule/MonthlyScheduleView";
import { AppointmentModal } from "@/components/AppointmentModal";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import {
	addDays,
	eachDayOfInterval,
	endOfWeek,
	format,
	isSameDay,
	parseISO,
	startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
	ArrowLeft,
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	Trash2,
	User,
	X,
	ExternalLink,
	Users,
	MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useDemo } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlanGuard } from "@/components/plans/PlanGuard";

const SchedulePage = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
	const [view, setView] = useState<"day" | "week" | "month">("month");
	const [showGoogleEvents, setShowGoogleEvents] = useState(true);
	const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
	const [appointmentModalDate, setAppointmentModalDate] = useState<
		Date | undefined
	>();
	const [actionInProgress, setActionInProgress] = useState<{
		id: number;
		action: "cancel" | "delete";
	} | null>(null);
	const navigate = useNavigate();
	const { events: googleEvents, isConnected: isGoogleConnected } =
		useGoogleCalendar();
	const { isDemoMode } = useDemo();
	const { user, isAuthenticated } = useAuth();

	// Utiliser le cache optimisé pour les données
	const {
		data: cachedAppointments,
		loading: appointmentsLoading,
		error: appointmentsError,
		invalidate: invalidateAppointments,
	} = useOptimizedCache(
		"appointments",
		() => {
			// Les services utilisent maintenant le routeur de stockage automatique
			return api.getAppointments();
		},
		{
			ttl: 2 * 60 * 1000,
			enabled: isDemoMode || (!!user && isAuthenticated),
		},
	);
	const {
		data: cachedPatients,
		loading: patientsLoading,
		error: patientsError,
		invalidate: invalidatePatients,
	} = useOptimizedCache(
		"patients",
		() => {
			// Les services utilisent maintenant le routeur de stockage automatique
			return api.getPatients();
		},
		{
			ttl: 10 * 60 * 1000,
			enabled: isDemoMode || (!!user && isAuthenticated),
		},
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
			weekStartsOn: 1,
		});
		const end = endOfWeek(selectedDate, {
			weekStartsOn: 1,
		});
		const days = eachDayOfInterval({
			start,
			end,
		});
		setCurrentWeek(days);
	}, [selectedDate]);

	// Helper functions (getPatientById, getDayAppointments) remain the same
	const getPatientById = (patientId: number) => {
		const patient = patients.find((patient) => patient.id === patientId);
		if (!patient) {
			console.warn(
				`Patient non trouvé pour ID ${patientId}. Total patients disponibles: ${patients.length}`,
			);
		}
		return patient;
	};
	const getDayAppointments = (date: Date) => {
		return appointments
			.filter((appointment) => {
				if (!appointment?.date) return false;
				try {
					const appointmentDate = parseISO(appointment.date);
					return (
						isSameDay(appointmentDate, date) &&
						(appointment.status === "SCHEDULED" ||
							appointment.status === "COMPLETED")
					);
				} catch {
					return false;
				}
			})
			.sort((a, b) => {
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
		return googleEvents
			.filter((event) => {
				if (!event?.start_time) return false;
				try {
					const eventDate = parseISO(event.start_time);
					return isSameDay(eventDate, date);
				} catch {
					return false;
				}
			})
			.sort((a, b) => {
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
				action: "cancel",
			});
			await api.cancelAppointment(appointmentId);
			toast.success("Séance annulée avec succès");

			// Mettre à jour localement et invalider le cache
			const updatedAppointments = appointments.map((appointment) =>
				appointment.id === appointmentId
					? {
							...appointment,
							status: "CANCELED" as AppointmentStatus,
						}
					: appointment,
			);
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
				action: "delete",
			});
			await api.deleteAppointment(appointmentId);
			toast.success("Séance supprimé avec succès");

			// Mettre à jour localement et invalider le cache
			const updatedAppointments = appointments.filter(
				(appointment) => appointment.id !== appointmentId,
			);
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
	const navigateToPreviousWeek = () =>
		setSelectedDate((prevDate) => addDays(prevDate, -7));
	const navigateToNextWeek = () =>
		setSelectedDate((prevDate) => addDays(prevDate, 7));
	const navigateToPreviousDay = () =>
		setSelectedDate((prevDate) => addDays(prevDate, -1));
	const navigateToNextDay = () =>
		setSelectedDate((prevDate) => addDays(prevDate, 1));
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
	const scheduleError = appointmentsError || patientsError;

	const handlePinConfigured = () => {
		invalidateAppointments();
		invalidatePatients();
	};

	return (
		<PlanGuard feature="schedule">
			<Layout>
				{/* Bouton de retour */}
				<div className="relative z-10">
					<div className="flex items-center gap-2 mb-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate(-1)}
							className="flex items-center gap-1"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Retour
						</Button>
					</div>
				</div>

				{/* Contenu principal */}
				<div className="flex flex-col min-h-screen">
					{/* Header type Appointment */}
					<div className="flex-shrink-0 p-3">
						<ScheduleHeader />
					</div>

					<div className="flex-1 overflow-y-auto p-3">
						{/* Header avec contrôles Google Calendar */}
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
							<h1 className="text-lg font-semibold flex items-center gap-2">
								<Clock className="h-5 w-5 text-slate-500" />
								Planning
							</h1>
							<div className="flex items-center gap-2 flex-wrap">
								{isGoogleConnected && (
									<div className="flex items-center gap-1">
										<div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-sm leading-none">
											<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
											Google
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												setShowGoogleEvents(
													!showGoogleEvents,
												)
											}
											className={cn(
												"text-sm h-6 px-2",
												showGoogleEvents
													? "text-slate-700"
													: "text-slate-400",
											)}
										>
											{showGoogleEvents
												? "Masquer"
												: "Afficher"}
										</Button>
									</div>
								)}
								<Tabs
									value={view}
									onValueChange={(v) =>
										setView(v as "day" | "week" | "month")
									}
									className="mr-1"
								>
									<TabsList className="h-7">
										<TabsTrigger
											value="day"
											className="text-sm h-6 px-2"
										>
											Jour
										</TabsTrigger>
										<TabsTrigger
											value="week"
											className="text-sm h-6 px-2"
										>
											Semaine
										</TabsTrigger>
										<TabsTrigger
											value="month"
											className="text-sm h-6 px-2"
										>
											Mois
										</TabsTrigger>
									</TabsList>
								</Tabs>

								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-sm"
										>
											<CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
											{selectedDate
												? format(
														selectedDate,
														"MMM yyyy",
														{
															locale: fr,
														},
													)
												: "Date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="end"
									>
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) =>
												date && setSelectedDate(date)
											}
											initialFocus
											className={cn(
												"p-2 pointer-events-auto",
											)}
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						{/* Loading state avec cache */}
						{isLoading && !appointments.length ? (
							<SmartSkeleton type="schedule" />
						) : (
							<Tabs value={view} defaultValue={view}>
								{/* TabsContent value="day" avec Google Events */}
								<TabsContent value="day">
									<div className="space-y-3">
										<div className="flex flex-col sm:flex-row items-center justify-between mb-3 gap-2">
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={
														navigateToPreviousDay
													}
													className="h-7 text-sm"
												>
													<ChevronLeft className="h-3.5 w-3.5" />
													Préc.
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={navigateToToday}
													className="h-7 text-sm"
												>
													Auj.
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={navigateToNextDay}
													className="h-7 text-sm"
												>
													Suiv.
													<ChevronRight className="h-3.5 w-3.5 ml-0.5" />
												</Button>
											</div>
											<h2 className="text-sm font-medium capitalize">
												{selectedDate
													? format(
															selectedDate,
															"EEEE d MMMM yyyy",
															{
																locale: fr,
															},
														)
													: "Date invalide"}
											</h2>
										</div>
										<DaySchedule
											date={selectedDate}
											appointments={getDayAppointments(
												selectedDate,
											)}
											googleEvents={getDayGoogleEvents(
												selectedDate,
											)}
											getPatientById={getPatientById}
											onCancelAppointment={
												handleCancelAppointment
											}
											onDeleteAppointment={
												handleDeleteAppointment
											}
											actionInProgress={actionInProgress}
										/>
									</div>
								</TabsContent>

								{/* TabsContent value="week" avec Google Events améliorés */}
								<TabsContent value="week">
									<div className="space-y-3">
										{/* Week navigation */}
										<div className="flex items-center justify-between mb-3">
											<Button
												variant="ghost"
												size="sm"
												onClick={navigateToPreviousWeek}
												className="h-7 text-sm"
											>
												<ChevronLeft className="h-3.5 w-3.5" />
												Préc.
											</Button>
											<h2 className="text-sm font-medium">
												{currentWeek[0]
													? format(
															currentWeek[0],
															"d MMM",
															{
																locale: fr,
															},
														)
													: "..."}{" "}
												-{" "}
												{currentWeek[6]
													? format(
															currentWeek[6],
															"d MMM yyyy",
															{
																locale: fr,
															},
														)
													: "..."}
											</h2>
											<Button
												variant="ghost"
												size="sm"
												onClick={navigateToNextWeek}
												className="h-7 text-sm"
											>
												Suiv.
												<ChevronRight className="h-3.5 w-3.5 ml-0.5" />
											</Button>
										</div>

										{/* Grid for the week */}
										<div className="grid grid-cols-1 md:grid-cols-7 gap-1">
											{currentWeek.map((day) => {
												const dayAppointments =
													getDayAppointments(day);
												const dayGoogleEvents =
													getDayGoogleEvents(day);
												const hasAnyEvents =
													dayAppointments.length >
														0 ||
													dayGoogleEvents.length > 0;
												return (
													<div
														key={day.toString()}
														className="flex flex-col"
													>
														{/* Day header button - compact */}
														<button
															type="button"
															className={cn(
																"p-1.5 text-center capitalize mb-1 rounded transition-colors w-full flex-shrink-0 h-10",
																isSameDay(
																	day,
																	new Date(),
																)
																	? "bg-slate-600 text-white"
																	: "bg-muted hover:bg-muted/80",
															)}
															onClick={() =>
																handleDayHeaderClick(
																	day,
																)
															}
															tabIndex={0}
															title={`Ajouter une séance le ${format(
																day,
																"d MMMM yyyy",
																{
																	locale: fr,
																},
															)}`}
															aria-label={`Ajouter une séance le ${format(
																day,
																"d MMMM yyyy",
																{
																	locale: fr,
																},
															)}`}
														>
															<div className="font-medium text-sm leading-none">
																{format(
																	day,
																	"EEE",
																	{
																		locale: fr,
																	},
																)}
															</div>
															<div className="text-sm text-muted-foreground leading-none mt-0.5">
																{format(
																	day,
																	"d",
																	{
																		locale: fr,
																	},
																)}
															</div>
														</button>

														{/* Events list or empty state */}
														{!hasAnyEvents ? (
															<div className="flex items-center justify-center p-1 text-center border border-dashed rounded h-8">
																<p className="text-sm text-muted-foreground leading-none">
																	—
																</p>
															</div>
														) : (
															<div className="space-y-0.5">
																{/* Google Calendar Events - compact */}
																{dayGoogleEvents.map(
																	(event) => {
																		let eventStartTime =
																			"??:??";
																		try {
																			if (
																				event?.start_time
																			) {
																				eventStartTime =
																					format(
																						parseISO(
																							event.start_time,
																						),
																						"HH:mm",
																					);
																			}
																		} catch {
																			eventStartTime =
																				"??:??";
																		}
																		return (
																			<div
																				key={
																					event.id
																				}
																				className="border-l-2 border-l-purple-400 bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-r h-10 flex flex-col justify-center"
																			>
																				<div className="flex items-center gap-1">
																					<span className="text-sm font-medium text-purple-700 dark:text-purple-300 leading-none">
																						{
																							eventStartTime
																						}
																					</span>
																					<span className="text-sm text-purple-500 dark:text-purple-400 leading-none">
																						G
																					</span>
																				</div>
																				<p className="text-sm text-purple-800 dark:text-purple-200 truncate leading-none mt-0.5">
																					{
																						event.summary
																					}
																				</p>
																			</div>
																		);
																	},
																)}

																{/* Internal Appointments - very compact */}
																{dayAppointments.map(
																	(
																		appointment,
																	) => {
																		const patient =
																			getPatientById(
																				appointment.patientId,
																			);
																		let appointmentTime =
																			"??:??";
																		try {
																			if (
																				appointment?.date
																			) {
																				appointmentTime =
																					format(
																						parseISO(
																							appointment.date,
																						),
																						"HH:mm",
																					);
																			}
																		} catch {
																			appointmentTime =
																				"??:??";
																		}
																		const isCompleted =
																			appointment.status ===
																			"COMPLETED";
																		return (
																			<Link
																				key={
																					appointment.id
																				}
																				to={`/appointments/${appointment.id}/edit`}
																				className={cn(
																					"block border-l-2 p-1.5 rounded-r transition-colors h-10 flex flex-col justify-center",
																					isCompleted
																						? "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
																						: "border-l-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800",
																				)}
																			>
																				<div className="flex items-center gap-1">
																					<span
																						className={cn(
																							"text-sm font-medium leading-none",
																							isCompleted
																								? "text-emerald-700 dark:text-emerald-300"
																								: "text-slate-700 dark:text-slate-300",
																						)}
																					>
																						{
																							appointmentTime
																						}
																					</span>
																					{isCompleted && (
																						<span className="text-sm text-emerald-600 dark:text-emerald-400 leading-none">
																							OK
																						</span>
																					)}
																				</div>
																				<p
																					className={cn(
																						"text-sm truncate leading-none mt-0.5",
																						isCompleted
																							? "text-emerald-800 dark:text-emerald-200"
																							: "text-slate-800 dark:text-slate-200",
																					)}
																				>
																					{patient
																						? `${patient.firstName} ${patient.lastName}`
																						: `#${appointment.patientId}`}
																				</p>
																			</Link>
																		);
																	},
																)}
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								</TabsContent>

								{/* Vue mensuelle */}
								<TabsContent value="month">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<AppointmentModal
												patients={patients}
												selectedDate={
													appointmentModalDate
												}
												isOpen={appointmentModalOpen}
												onOpenChange={
													setAppointmentModalOpen
												}
												onSuccess={
													handleAppointmentSuccess
												}
											/>
										</div>
									</div>
									<MonthlyScheduleView
										appointments={appointments}
										patients={patients}
										selectedDate={selectedDate}
										onDateChange={setSelectedDate}
										onDayClick={handleDayHeaderClick}
									/>
								</TabsContent>
							</Tabs>
						)}
					</div>
				</div>
			</Layout>
		</PlanGuard>
	);
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
	actionInProgress,
}: DayScheduleProps) => {
	// Time slot generation logic remains the same
	const timeSlots = Array.from(
		{
			length: 25,
		},
		(_, i) => {
			const hour = Math.floor(i / 2) + 8;
			const minute = (i % 2) * 30;
			return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
		},
	);
	const displayTimeSlots = timeSlots.filter(
		(slot) => parseInt(slot.split(":")[0]) < 20,
	);
	const getAppointmentForTimeSlot = (timeSlot: string) => {
		return appointments.find((appointment) => {
			try {
				if (!appointment?.date) return false;
				return format(parseISO(appointment.date), "HH:mm") === timeSlot;
			} catch {
				return false;
			}
		});
	};
	const getGoogleEventForTimeSlot = (timeSlot: string) => {
		return googleEvents.find((event) => {
			try {
				if (!event?.start_time) return false;
				return format(parseISO(event.start_time), "HH:mm") === timeSlot;
			} catch {
				return false;
			}
		});
	};
	return (
		<div className="rounded-md border">
			{displayTimeSlots.map((timeSlot) => {
				const appointment = getAppointmentForTimeSlot(timeSlot);
				const googleEvent = getGoogleEventForTimeSlot(timeSlot);
				const isCurrentTime = (() => {
					try {
						const now = new Date();
						return (
							format(now, "HH:mm") === timeSlot &&
							isSameDay(date, now)
						);
					} catch {
						return false;
					}
				})();
				const isProcessingAction =
					appointment && actionInProgress?.id === appointment.id;
				const isCompleted = appointment?.status === "COMPLETED";
				return (
					<div
						key={timeSlot}
						className={cn(
							"flex border-b last:border-b-0 transition-colors",
							isCurrentTime
								? "bg-primary/5"
								: "hover:bg-muted/50",
						)}
					>
						{/* Time slot display */}
						<div className="w-20 p-3 border-r bg-muted/20 flex items-center justify-center shrink-0">
							<span
								className={cn(
									"text-sm font-medium",
									isCurrentTime
										? "text-primary"
										: "text-muted-foreground",
								)}
							>
								{timeSlot}
							</span>
						</div>

						{/* Appointment details or Google event or link */}
						<div className="flex-1 p-3 min-w-0">
							{googleEvent ? (
								<div className="flex flex-col lg:flex-row items-start justify-between gap-2 border-l-4 border-l-purple-500 bg-purple-100 dark:bg-purple-900/20 p-4 lg:p-5 xl:p-6 rounded">
									<div className="flex-grow min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<Badge className="bg-purple-800 text-white text-sm lg:text-base">
												Google
											</Badge>
											{googleEvent.is_doctolib && (
												<Badge className="bg-teal-600 text-white text-sm lg:text-base">
													Doctolib
												</Badge>
											)}
											<h3 className="font-semibold text-lg lg:text-xl xl:text-2xl text-purple-900 dark:text-purple-100 truncate">
												{googleEvent.summary}
											</h3>
										</div>
										{googleEvent.location && (
											<p className="text-base lg:text-lg xl:text-xl text-purple-700 dark:text-purple-300 ml-2 truncate font-medium flex items-center gap-1">
												<MapPin className="h-4 w-4 flex-shrink-0" /> {googleEvent.location}
											</p>
										)}
										{googleEvent.matched_patient_name && (
											<div className="flex items-center gap-1 mt-1 ml-2">
												<Users className="h-4 w-4 lg:h-5 lg:w-5 text-teal-600 dark:text-teal-400" />
												<span className="text-sm lg:text-base text-teal-700 dark:text-teal-300 font-medium">
													{
														googleEvent.matched_patient_name
													}
												</span>
												{googleEvent.matched_patient_id && (
													<Link
														to={`/patients/${googleEvent.matched_patient_id}`}
														className="text-sm lg:text-base text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 ml-2"
													>
														<ExternalLink className="h-4 w-4" />
														Voir la fiche
													</Link>
												)}
											</div>
										)}
										<p className="text-sm lg:text-sm text-purple-600 dark:text-purple-400 mt-1">
											Événement externe (lecture seule)
										</p>
									</div>
								</div>
							) : appointment ? (
								<div
									className={cn(
										"flex flex-col lg:flex-row items-start justify-between gap-2 border-l-4 p-4 lg:p-5 xl:p-6 rounded",
										isCompleted
											? "border-l-green-500 bg-green-100 dark:bg-green-900/20"
											: "border-l-blue-500 bg-blue-100 dark:bg-blue-900/20",
									)}
								>
									{/* Appointment Info */}
									<div className="flex-grow min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<User
												className={cn(
													"h-5 w-5 lg:h-6 lg:w-6 shrink-0",
													isCompleted
														? "text-green-700 dark:text-green-400"
														: "text-blue-700 dark:text-blue-400",
												)}
											/>
											<Link
												to={`/patients/${appointment.patientId}`}
												className={cn(
													"font-semibold text-lg lg:text-xl xl:text-2xl hover:underline truncate",
													isCompleted
														? "text-green-900 dark:text-green-100"
														: "text-blue-900 dark:text-blue-100",
												)}
											>
												{getPatientById(
													appointment.patientId,
												)?.firstName || ""}{" "}
												{getPatientById(
													appointment.patientId,
												)?.lastName ||
													`Patient #${appointment.patientId}`}
											</Link>
											{isCompleted && (
												<Badge className="bg-green-700 text-white dark:bg-green-600 text-sm lg:text-base">
													Terminé
												</Badge>
											)}
										</div>
										<p
											className={cn(
												"text-base lg:text-lg xl:text-xl ml-6 truncate font-medium",
												isCompleted
													? "text-green-700 dark:text-green-300"
													: "text-blue-700 dark:text-blue-300",
											)}
										>
											{appointment.reason}
										</p>
									</div>
									{/* Action Buttons - Made responsive */}
									<div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto shrink-0">
										{/* Link Buttons */}
										<Button
											variant="outline"
											size="sm"
											asChild
											className="flex-grow lg:flex-grow-0"
										>
											<Link
												to={`/invoices/new?appointmentId=${appointment.id}`}
												aria-label="Créer une Note d'honoraire pour ce Séance"
											>
												<FileText className="h-4 w-4 mr-1" />{" "}
												Note d'honoraire
											</Link>
										</Button>
										<Button
											variant="outline"
											size="sm"
											asChild
											className="flex-grow lg:flex-grow-0"
										>
											<Link
												to={`/appointments/${appointment.id}/edit`}
												aria-label="Voir les détails de la séance"
											>
												Détails
											</Link>
										</Button>
										{/* Destructive Buttons */}
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive hover:bg-destructive/10 flex-grow lg:flex-grow-0"
											onClick={() =>
												onCancelAppointment(
													appointment.id,
												)
											}
											disabled={
												isProcessingAction ||
												isCompleted
											}
											aria-label="Annuler cette séance"
										>
											{isProcessingAction &&
											actionInProgress?.action ===
												"cancel" ? (
												<span className="flex items-center">
													<span className="animate-spin mr-1">
														⏳
													</span>
													Annulation...
												</span>
											) : (
												<>
													<X className="h-4 w-4 mr-1" />{" "}
													Annuler{" "}
												</>
											)}
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive hover:bg-destructive/10 flex-grow lg:flex-grow-0"
													disabled={
														isProcessingAction
													}
												>
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
													<AlertDialogAction
														onClick={() =>
															onDeleteAppointment(
																appointment.id,
															)
														}
														className="bg-destructive hover:bg-destructive/90"
													>
														{isProcessingAction &&
														actionInProgress?.action ===
															"delete" ? (
															<span className="animate-spin mr-2">
																⏳
															</span>
														) : null}
														Supprimer
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							) : (
								<Link
									to={`/appointments/new?date=${format(date, "yyyy-MM-dd")}&time=${timeSlot}`}
									className="flex h-full items-center justify-center text-sm text-muted-foreground hover:text-primary"
									aria-label={`Créer un Séance le ${format(
										date,
										"d MMMM yyyy",
										{
											locale: fr,
										},
									)} à ${timeSlot}`}
								>
									<span className="text-center">
										Disponible
									</span>
								</Link>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};
export default SchedulePage;
