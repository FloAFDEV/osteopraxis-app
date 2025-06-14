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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import ScheduleEmptyState from "@/components/schedule/ScheduleEmptyState";

const SchedulePage = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
	const [view, setView] = useState<"day" | "week">("week");
	const [actionInProgress, setActionInProgress] = useState<{
		id: number;
		action: "cancel" | "delete";
	} | null>(null);
	const navigate = useNavigate();

	// Utiliser le hook pour la mise à jour automatique des statuts
	useAppointmentStatusUpdate({
		appointments,
		onAppointmentsUpdate: setAppointments
	});

	// useEffect for fetching data remains the same
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
				toast.error(
					"Impossible de charger les données. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// useEffect for calculating week remains the same
	useEffect(() => {
		const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
		const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
		const days = eachDayOfInterval({ start, end });
		setCurrentWeek(days);
	}, [selectedDate]);

	// Helper functions (getPatientById, getDayAppointments) remain the same
	const getPatientById = (patientId: number) => {
		return patients.find((patient) => patient.id === patientId);
	};

	// Mise à jour pour inclure les séances avec statut COMPLETED
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

	// Action handlers (handleCancelAppointment, handleDeleteAppointment) remain the same
	const handleCancelAppointment = async (appointmentId: number) => {
		try {
			setActionInProgress({ id: appointmentId, action: "cancel" });
			await api.cancelAppointment(appointmentId);
			toast.success("Séance annulée avec succès");
			const updatedAppointments = appointments.map((appointment) =>
				appointment.id === appointmentId
					? {
							...appointment,
							status: "CANCELED" as AppointmentStatus,
					  }
					: appointment
			);
			setAppointments(updatedAppointments);
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			toast.error("Impossible d'annuler la séance");
		} finally {
			setActionInProgress(null);
		}
	};

	const handleDeleteAppointment = async (appointmentId: number) => {
		try {
			setActionInProgress({ id: appointmentId, action: "delete" });
			await api.deleteAppointment(appointmentId);
			toast.success("Séance supprimé avec succès");
			const updatedAppointments = appointments.filter(
				(appointment) => appointment.id !== appointmentId
			);
			setAppointments(updatedAppointments);
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
		const dateStr = format(date, "yyyy-MM-dd");
		navigate(`/appointments/new?date=${dateStr}`);
	};

	// --- JSX Structure ---
	return (
		<Layout>
			<div className="flex items-center gap-2">
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
			<div className="flex flex-col p-4 sm:p-6 lg:p-8 mt-20">
				{/* --- NEW HEADER --- */}
				<ScheduleHeader />
				{/* Header and navigation section stays the same */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Clock className="h-8 w-8 text-amber-500" />
						Planning
					</h1>
					<div className="flex items-center gap-2">
						<Tabs
							value={view}
							onValueChange={(v) => setView(v as "day" | "week")}
							className="mr-2"
						>
							<TabsList>
								<TabsTrigger value="day">Jour</TabsTrigger>
								<TabsTrigger value="week">Semaine</TabsTrigger>
							</TabsList>
						</Tabs>
						<Button
							variant="outline"
							size="sm"
							onClick={navigateToToday}
						>
							Aujourd'hui
						</Button>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="ml-auto"
								>
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
									onSelect={(date) =>
										date && setSelectedDate(date)
									}
									initialFocus
									className={cn("p-3 pointer-events-auto")}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
				{/* Loading state remains unchanged */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						{/* ... loading indicator ... */}
					</div>
				) : (
					<Tabs value={view} defaultValue={view}>
						<TabsContent value="day">
							<div className="space-y-4">
								<div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
									<div className="flex gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={navigateToPreviousDay}
										>
											<ChevronLeft className="h-4 w-4" />{" "}
											Jour précédent
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={navigateToToday}
										>
											Aujourd'hui
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={navigateToNextDay}
										>
											Jour suivant{" "}
											<ChevronRight className="h-4 w-4 ml-1" />
										</Button>
									</div>
									<h2 className="text-xl font-medium capitalize mt-2 sm:mt-0">
										{format(
											selectedDate,
											"EEEE d MMMM yyyy",
											{ locale: fr }
										)}
									</h2>
								</div>
								{/* Check for no appointments in the day */}
								{getDayAppointments(selectedDate).length === 0 ? (
									<ScheduleEmptyState date={selectedDate} />
								) : (
									<DaySchedule
										date={selectedDate}
										appointments={getDayAppointments(selectedDate)}
										getPatientById={getPatientById}
										onCancelAppointment={handleCancelAppointment}
										onDeleteAppointment={handleDeleteAppointment}
										actionInProgress={actionInProgress}
									/>
								)}
							</div>
						</TabsContent>
						<TabsContent value="week">
							<div className="space-y-4">
								<div className="flex items-center justify-between mb-4">
									<Button
										variant="ghost"
										size="sm"
										onClick={navigateToPreviousWeek}
									>
										<ChevronLeft className="h-4 w-4" />{" "}
										Semaine précédente
									</Button>
									<h2 className="text-xl font-medium">
										Semaine du{" "}
										{format(currentWeek[0], "d MMMM", {
											locale: fr,
										})}{" "}
										au{" "}
										{format(currentWeek[6], "d MMMM yyyy", {
											locale: fr,
										})}
									</h2>
									<Button
										variant="ghost"
										size="sm"
										onClick={navigateToNextWeek}
									>
										Semaine suivante{" "}
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
								{/* Grid for the week */}
								{currentWeek.every(day => getDayAppointments(day).length === 0) ? (
									<ScheduleEmptyState />
								) : (
									<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
										{currentWeek.map((day) => (
											<div
												key={day.toString()}
												className="flex flex-col"
											>
												{/* Day header button remains the same */}
												<button
													type="button"
													className={cn(
														"p-2 text-center capitalize mb-2 rounded-md transition-colors hover:bg-blue-100 active:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-primary w-full",
														isSameDay(day, new Date())
															? "bg-amber-600 text-amber-100 dark:bg-amber-500 dark:text-amber-900"
															: "bg-muted dark:bg-muted"
													)}
													onClick={() =>
														handleDayHeaderClick(day)
													}
													tabIndex={0}
													title={`Ajouter un Séance le ${format(
														day,
														"d MMMM yyyy",
														{ locale: fr }
													)}`}
													aria-label={`Ajouter un Séance le ${format(
														day,
														"d MMMM yyyy",
														{ locale: fr }
													)}`}
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
														Ajouter un Séance
													</span>
												</button>

												{/* Appointments list or empty state */}
												{getDayAppointments(day).length ===
												0 ? (
													<div className="flex-1 flex items-center justify-center p-4 text-center border border-dashed rounded-md">
														<p className="text-sm text-muted-foreground">
															Aucune séance
														</p>
													</div>
												) : (
													<div className="space-y-2">
														{getDayAppointments(
															day
														).map((appointment) => {
															const patient =
																getPatientById(
																	appointment.patientId
																);
															const appointmentTime =
																format(
																	parseISO(
																		appointment.date
																	),
																	"HH:mm"
																);
															const isProcessingAction =
																actionInProgress?.id ===
																appointment.id;

															return (
																<Card
																	key={
																		appointment.id
																	}
																	className="hover-scale flex flex-col"
																>
																	{" "}
																	{/* Added flex flex-col */}
																	<CardContent className="p-3 flex-grow">
																		{" "}
																		{/* Added flex-grow */}
																		{/* Top section: Time Badge */}
																		<div className="flex items-center justify-between mb-2">
																			{" "}
																			{/* Adjusted margin */}
																			<Badge className="bg-blue-500">
																				{
																					appointmentTime
																				}
																			</Badge>
																			{appointment.status ===
																				"COMPLETED" && (
																				<Badge className="bg-amber-500">
																					Terminé
																				</Badge>
																			)}
																			{/* Buttons removed from here */}
																		</div>
																		{/* Middle section: Link to patient/reason */}
																		<Link
																			to={`/appointments/${appointment.id}/edit`}
																			className="block group mb-3" // Added bottom margin
																		>
																			<h3 className="font-medium group-hover:text-primary truncate">
																				{patient
																					? `${patient.firstName} ${patient.lastName}`
																					: `Patient #${appointment.patientId}`}
																			</h3>
																			<p className="text-sm text-muted-foreground truncate">
																				{
																					appointment.reason
																				}
																			</p>
																		</Link>
																	</CardContent>
																	{/* --- Bottom section: Action Buttons --- */}
																	<div className="flex flex-col sm:flex-row items-center justify-end gap-2 p-2 border-t bg-muted/30">
																		{/* Cancel Button */}
																		<Button
																			variant="ghost"
																			size="sm"
																			className="w-full sm:w-auto text-destructive hover:bg-destructive/10 h-8 px-3 flex items-center justify-center space-x-1"
																			onClick={() =>
																				handleCancelAppointment(
																					appointment.id
																				)
																			}
																			disabled={
																				isProcessingAction ||
																				appointment.status ===
																					"COMPLETED"
																			}
																			title="Annuler cette séance"
																		>
																			{actionInProgress?.id ===
																				appointment.id &&
																				actionInProgress.action ===
																					"cancel" && (
																					<span className="animate-spin text-base">
																						⏳
																					</span>
																				)}
																			<X className="w-4 h-4" />
																			<span className="hidden sm:inline">
																				Annuler
																			</span>
																		</Button>

																		{/* Delete Button Trigger */}
																		<AlertDialog>
																			<AlertDialogTrigger
																				asChild
																			>
																				<Button
																					variant="ghost"
																					size="sm"
																					className="w-full sm:w-auto text-destructive hover:bg-destructive/10 h-8 px-3 flex items-center justify-center" // Responsive width, centered text/icon
																					disabled={
																						isProcessingAction
																					}
																					title="Supprimer cette séance"
																				>
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
																					<AlertDialogAction
																						onClick={() =>
																							handleDeleteAppointment(
																								appointment.id
																							)
																						}
																						className="bg-destructive hover:bg-destructive/90" // Adjusted hover color
																					>
																						{actionInProgress?.id ===
																							appointment.id &&
																						actionInProgress.action ===
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
																</Card>
															);
														})}
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</Layout>
	);
};

// DaySchedule Component (Check responsiveness of its buttons too)
interface DayScheduleProps {
	date: Date;
	appointments: Appointment[];
	getPatientById: (id: number) => Patient | undefined;
	onCancelAppointment: (id: number) => void;
	onDeleteAppointment: (id: number) => void;
	actionInProgress: { id: number; action: "cancel" | "delete" } | null;
}

const DaySchedule = ({
	date,
	appointments,
	getPatientById,
	onCancelAppointment,
	onDeleteAppointment,
	actionInProgress,
}: DayScheduleProps) => {
	// Time slot generation logic remains the same
	const timeSlots = Array.from({ length: 25 }, (_, i) => {
		const hour = Math.floor(i / 2) + 8;
		const minute = (i % 2) * 30;
		return `${hour.toString().padStart(2, "0")}:${minute
			.toString()
			.padStart(2, "0")}`;
	});
	const displayTimeSlots = timeSlots.filter(
		(slot) => parseInt(slot.split(":")[0]) < 20
	);
	const getAppointmentForTimeSlot = (timeSlot: string) => {
		return appointments.find(
			(appointment) =>
				format(parseISO(appointment.date), "HH:mm") === timeSlot
		);
	};

	return (
		<div className="rounded-md border">
			{displayTimeSlots.map((timeSlot) => {
				const appointment = getAppointmentForTimeSlot(timeSlot);
				const isCurrentTime =
					format(new Date(), "HH:mm") === timeSlot &&
					isSameDay(date, new Date());
				const isProcessingAction =
					appointment && actionInProgress?.id === appointment.id;
				const isCompleted = appointment?.status === "COMPLETED";

				return (
					<div
						key={timeSlot}
						className={cn(
							"flex border-b last:border-b-0 transition-colors",
							isCurrentTime ? "bg-primary/5" : "hover:bg-muted/50"
						)}
					>
						{/* Time slot display */}
						<div className="w-20 p-3 border-r bg-muted/20 flex items-center justify-center shrink-0">
							{" "}
							{/* Added shrink-0 */}
							<span
								className={cn(
									"text-sm font-medium",
									isCurrentTime
										? "text-primary"
										: "text-muted-foreground"
								)}
							>
								{timeSlot}
							</span>
						</div>

						{/* Appointment details or link */}
						<div className="flex-1 p-3 min-w-0">
							{" "}
							{/* Added min-w-0 to prevent overflow */}
							{appointment ? (
								<div className="flex flex-col lg:flex-row items-start justify-between gap-2">
									{" "}
									{/* Responsive layout for content vs actions */}
									{/* Appointment Info */}
									<div className="flex-grow min-w-0">
										{" "}
										{/* Added min-w-0 */}
										<div className="flex items-center gap-2 mb-1">
											<User className="h-4 w-4 text-primary shrink-0" />
											<Link
												to={`/patients/${appointment.patientId}`}
												className="font-medium hover:text-primary truncate" // Added truncate
											>
												{getPatientById(
													appointment.patientId
												)?.firstName || ""}{" "}
												{getPatientById(
													appointment.patientId
												)?.lastName ||
													`Patient #${appointment.patientId}`}
											</Link>
											{isCompleted && (
												<Badge className="bg-amber-500 text-white">
													Terminé
												</Badge>
											)}
										</div>
										<p className="text-sm text-muted-foreground ml-6 truncate">
											{" "}
											{/* Added truncate */}
											{appointment.reason}
										</p>
									</div>
									{/* Action Buttons - Made responsive */}
									<div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto shrink-0">
										{" "}
										{/* flex-wrap, responsive width */}
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
											className="text-destructive hover:bg-destructive/10 flex-grow lg:flex-grow-0" // Responsive grow
											onClick={() =>
												onCancelAppointment(
													appointment.id
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
													{" "}
													<X className="h-4 w-4 mr-1" />{" "}
													Annuler{" "}
												</> // Added Icon
											)}
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive hover:bg-destructive/10 flex-grow lg:flex-grow-0" // Responsive grow
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
																appointment.id
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
									to={`/appointments/new?date=${format(
										date,
										"yyyy-MM-dd"
									)}&time=${timeSlot}`}
									className="flex h-full items-center justify-center text-sm text-muted-foreground hover:text-primary"
									aria-label={`Créer un Séance le ${format(
										date,
										"d MMMM yyyy",
										{ locale: fr }
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
