import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	Plus,
	Calendar,
	Filter,
	Search,
	RefreshCw,
	Clock,
	Home,
	ArrowRight,
	ChevronDown, // Import ChevronDown for expand/collapse indication
	CalendarX, // Use a different icon for empty state
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentCard } from "@/components/appointment-card"; // Assuming this component exists and is well-styled
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

const AppointmentsPage = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [appointmentToCancel, setAppointmentToCancel] =
		useState<Appointment | null>(null);
	const location = useLocation();

	const [refreshKey, setRefreshKey] = useState(0);

	// States for toggling visibility of sections
	const [showPast, setShowPast] = useState(false);
	const [showToday, setShowToday] = useState(true); // Default open
	const [showFuture, setShowFuture] = useState(false);
	const [selectedPastYear, setSelectedPastYear] = useState<
		number | undefined
	>(undefined);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true); // Ensure loading is true at the start
			try {
				const [appointmentsData, patientsData] = await Promise.all([
					api.getAppointments(),
					api.getPatients(),
				]);
				setAppointments(appointmentsData);
				setPatients(patientsData);
			} catch (error) {
				console.error("Failed to fetch data:", error);
				toast.error(
					"Impossible de charger les données. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [refreshKey]); // Dependency array includes refreshKey

	const getPatientById = (patientId: number): Patient | undefined => {
		return patients.find((patient) => patient.id === patientId);
	};

	// Memoize filtered appointments to avoid recalculation on every render if inputs haven't changed
	// This would be better with useMemo, but for simplicity here, it's a function call
	const getFilteredAppointments = (): Appointment[] => {
		return appointments
			.filter((appointment) => {
				if (
					statusFilter !== "all" &&
					appointment.status !== statusFilter
				) {
					return false;
				}
				const patient = getPatientById(appointment.patientId);
				const searchLower = searchQuery.toLowerCase();
				if (searchQuery === "") return true;

				const patientNameMatch = patient
					? `${patient.firstName} ${patient.lastName}`
							.toLowerCase()
							.includes(searchLower)
					: false;
				const reasonMatch = appointment.reason
					.toLowerCase()
					.includes(searchLower);

				return patientNameMatch || reasonMatch;
			})
			.sort(
				// Keep a default sort, maybe by date descending overall? Adjust as needed.
				(a, b) =>
					new Date(a.date).getTime() - new Date(b.date).getTime()
			);
	};

	// Categorize appointments (could be memoized with useMemo)
	const categorizeAppointments = (filteredApps: Appointment[]) => {
		const todayStr = format(new Date(), "yyyy-MM-dd");
		const past: Appointment[] = [];
		const today: Appointment[] = [];
		const future: Appointment[] = [];

		filteredApps.forEach((appointment) => {
			const appointmentDate = new Date(appointment.date);
			const appointmentDateStr = format(appointmentDate, "yyyy-MM-dd");

			if (appointmentDateStr < todayStr) {
				past.push(appointment);
			} else if (appointmentDateStr === todayStr) {
				today.push(appointment);
			} else {
				future.push(appointment);
			}
		});

		// Sort within categories
		past.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		); // Most recent past first
		today.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		); // Earliest today first
		future.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		); // Earliest future first

		return {
			pastAppointments: past,
			todayAppointments: today,
			futureAppointments: future,
		};
	};

	// Grouping functions (could be memoized or moved to utils)
	const groupAppointmentsByMonthAndDay = (
		apps: Appointment[]
	): Record<string, Record<string, Appointment[]>> => {
		const grouped: Record<string, Record<string, Appointment[]>> = {};
		apps.forEach((appointment) => {
			const date = new Date(appointment.date);
			const monthYear = format(date, "MMMM yyyy", { locale: fr });
			const day = format(date, "yyyy-MM-dd");

			if (!grouped[monthYear]) {
				grouped[monthYear] = {};
			}
			if (!grouped[monthYear][day]) {
				grouped[monthYear][day] = [];
			}
			grouped[monthYear][day].push(appointment);
		});
		return grouped;
	};

	const handleCancelAppointment = async () => {
		if (!appointmentToCancel) return;
		const originalAppointment = { ...appointmentToCancel }; // Keep original details for toast/rollback
		try {
			// Optimistic UI update
			setAppointments((prevAppointments) =>
				prevAppointments.map((app) =>
					app.id === appointmentToCancel.id
						? { ...app, status: "CANCELED" }
						: app
				)
			);
			setAppointmentToCancel(null); // Close dialog immediately
			toast.success("Rendez-vous annulé avec succès");

			await api.updateAppointment(originalAppointment.id, {
				status: "CANCELED",
				date: originalAppointment.date, // Send original date
			});
			// Optionally trigger refresh if optimistic update isn't enough or backend confirmation is needed
			// setRefreshKey((prev) => prev + 1);
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			toast.error(
				"Une erreur est survenue lors de l'annulation. Le rendez-vous a été restauré."
			);
			// Rollback optimistic update
			setAppointments((prevAppointments) =>
				prevAppointments.map((app) =>
					app.id === originalAppointment.id
						? originalAppointment
						: app
				)
			);
		}
		// No finally block needed for setAppointmentToCancel(null) as it's done earlier
	};

	// --- Data Preparation for Rendering ---
	const filteredAppointments = getFilteredAppointments();
	const { pastAppointments, todayAppointments, futureAppointments } =
		categorizeAppointments(filteredAppointments);

	const filteredPastAppointmentsByYear = pastAppointments.filter(
		(appointment) => {
			if (!selectedPastYear) return true;
			return (
				new Date(appointment.date).getFullYear() === selectedPastYear
			);
		}
	);

	const groupedPastAppointments = groupAppointmentsByMonthAndDay(
		filteredPastAppointmentsByYear
	);
	const groupedFutureAppointments =
		groupAppointmentsByMonthAndDay(futureAppointments);
	// Today's appointments don't usually need month grouping
	const groupedTodayAppointments =
		groupAppointmentsByMonthAndDay(todayAppointments); // Grouping just to get the date key easily

	// --- Component Return ---
	return (
		<Layout>
			<div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8">
				{" "}
				{/* Added responsive padding */}
				{/* Section Titre et Actions */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
						<Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
						Rendez-vous
					</h1>
					<div className="flex gap-2 sm:gap-4">
						<Button
							variant="outline"
							size="sm" // Smaller button on mobile
							disabled={loading}
							onClick={() => setRefreshKey((prev) => prev + 1)} // Simplified refresh
							className="flex items-center gap-2"
						>
							<RefreshCw
								className={`h-4 w-4 ${
									loading ? "animate-spin" : ""
								}`}
							/>
							<span className="hidden sm:inline">
								{loading ? "Chargement..." : "Actualiser"}
							</span>{" "}
							{/* Hide text on small screens */}
							<span className="sm:hidden">Actualiser</span>{" "}
							{/* Show text on smaller screens */}
						</Button>
						<Button asChild size="sm">
							<Link
								to="/appointments/new"
								className="flex items-center gap-2"
							>
								<Plus className="h-4 w-4" />
								<span className="hidden sm:inline">
									Nouveau rendez-vous
								</span>{" "}
								{/* Hide text on small screens */}
								<span className="sm:hidden">Nouveau</span>{" "}
								{/* Shorter text on small screens */}
							</Link>
						</Button>
					</div>
				</div>
				{/* Section Recherche et Filtrage */}
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-grow relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher patient, motif..."
							className="pl-10 w-full" // Ensure full width
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="w-full md:w-auto md:min-w-[200px] flex items-center gap-2">
						{" "}
						{/* Adjusted width and gap */}
						<Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
						>
							<SelectTrigger className="flex-grow">
								<SelectValue placeholder="Filtrer par statut" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									Tous les statuts
								</SelectItem>
								<SelectItem value="SCHEDULED">
									Planifiés
								</SelectItem>
								<SelectItem value="COMPLETED">
									Terminés
								</SelectItem>
								<SelectItem value="CANCELED">
									Annulés
								</SelectItem>
								<SelectItem value="RESCHEDULED">
									Reportés
								</SelectItem>
								<SelectItem value="NO_SHOW">
									Non présentés
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				{/* --- Loading State --- */}
				{loading ? (
					<div className="space-y-8 py-8">
						{/* Skeleton for section header */}
						<div className="flex items-center justify-between p-3 rounded-md bg-gray-100">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-5 w-5" />
						</div>
						{/* Skeleton for appointment cards */}
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Skeleton className="h-36 rounded-lg" />
							<Skeleton className="h-36 rounded-lg" />
							<Skeleton className="h-36 rounded-lg" />
							<Skeleton className="h-36 rounded-lg md:hidden lg:block" />{" "}
							{/* Show more on larger screens */}
							<Skeleton className="h-36 rounded-lg md:hidden lg:block" />
							<Skeleton className="h-36 rounded-lg md:hidden lg:block" />
						</div>
						{/* Repeat for other potential sections */}
						<div className="flex items-center justify-between p-3 rounded-md bg-gray-100">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-5 w-5" />
						</div>
					</div>
				) : (
					<>
						{" "}
						{/* Use Fragment to avoid unnecessary divs */}
						{/* --- Today's Appointments --- */}
						{todayAppointments.length > 0 && (
							<div className="mb-8">
								{" "}
								{/* Added margin bottom */}
								<div
									className="flex justify-between items-center cursor-pointer p-3 rounded-md border-l-4 border-green-500 bg-green-50 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-700 transition-colors"
									onClick={() => setShowToday(!showToday)}
								>
									<div className="flex items-center gap-3">
										<Home className="h-5 w-5 text-green-700 dark:text-green-300" />
										<span className="text-lg font-semibold text-green-800 dark:text-green-200">
											Aujourd'hui
										</span>
										<span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-green-100 bg-green-600 dark:bg-green-700 rounded-full">
											{todayAppointments.length}
										</span>
									</div>
									<ChevronDown
										className={`h-5 w-5 text-green-700 dark:text-green-300 transition-transform duration-200 ${
											showToday ? "" : "-rotate-90"
										}`}
									/>
								</div>
								{showToday && (
									<div className="border-l-4 border-green-500 pl-4 ml-[1px] py-4 bg-white dark:bg-gray-800 rounded-b-md shadow-sm">
										{" "}
										{/* Indentation and styling */}
										{Object.entries(
											groupedTodayAppointments
										).map(([monthYear, days]) =>
											Object.entries(days).map(
												([
													dateStr,
													appointmentsForDate,
												]) => (
													<div
														key={dateStr}
														className="space-y-4"
													>
														{/* No need for date header again, it's implicit */}
														<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
															{appointmentsForDate.map(
																(
																	appointment
																) => (
																	<AppointmentCard
																		key={
																			appointment.id
																		}
																		appointment={
																			appointment
																		}
																		patient={getPatientById(
																			appointment.patientId
																		)}
																		onEdit={() =>
																			(window.location.href = `/appointments/${appointment.id}/edit`)
																		} // Consider using useNavigate hook from react-router-dom
																		onCancel={() =>
																			setAppointmentToCancel(
																				appointment
																			)
																		}
																	/>
																)
															)}
														</div>
													</div>
												)
											)
										)}
									</div>
								)}
							</div>
						)}
						{/* --- Future Appointments --- */}
						{futureAppointments.length > 0 && (
							<div className="mb-8">
								<div
									className="flex justify-between items-center cursor-pointer p-3 rounded-md border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-700 transition-colors"
									onClick={() => setShowFuture(!showFuture)}
								>
									<div className="flex items-center gap-3">
										<ArrowRight className="h-5 w-5 text-blue-700 dark:text-blue-300" />
										<span className="text-lg font-semibold text-blue-800 dark:text-blue-200">
											À venir
										</span>
										<span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-blue-100 bg-blue-600 dark:bg-blue-700 rounded-full">
											{futureAppointments.length}
										</span>
									</div>
									<ChevronDown
										className={`h-5 w-5 text-blue-700 dark:text-blue-300 transition-transform duration-200 ${
											showFuture ? "" : "-rotate-90"
										}`}
									/>
								</div>
								{showFuture && (
									<div className="border-l-4 border-blue-500 pl-4 ml-[1px] py-4 bg-white dark:bg-gray-800 rounded-b-md shadow-sm space-y-6">
										{Object.entries(
											groupedFutureAppointments
										).map(
											([monthYear, days], monthIndex) => (
												<div key={monthYear}>
													<h3
														className={`text-xl font-semibold text-amber-600 mb-4 ${
															monthIndex > 0
																? "mt-6"
																: ""
														}`}
													>
														{monthYear}
													</h3>
													<div className="space-y-6">
														{Object.entries(
															days
														).map(
															([
																dateStr,
																appointmentsForDate,
															]) => {
																const formattedDate =
																	format(
																		new Date(
																			dateStr
																		),
																		"EEEE d",
																		{
																			locale: fr,
																		}
																	); // Shorter day format
																return (
																	<div
																		key={
																			dateStr
																		}
																	>
																		<h4 className="text-md font-medium text-primary mb-3">
																			{
																				formattedDate
																			}
																		</h4>
																		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
																			{appointmentsForDate.map(
																				(
																					appointment
																				) => (
																					<AppointmentCard
																						key={
																							appointment.id
																						}
																						appointment={
																							appointment
																						}
																						patient={getPatientById(
																							appointment.patientId
																						)}
																						onEdit={() =>
																							(window.location.href = `/appointments/${appointment.id}/edit`)
																						}
																						onCancel={() =>
																							setAppointmentToCancel(
																								appointment
																							)
																						}
																					/>
																				)
																			)}
																		</div>
																	</div>
																);
															}
														)}
													</div>
												</div>
											)
										)}
									</div>
								)}
							</div>
						)}
						{/* --- Past Appointments --- */}
						{pastAppointments.length > 0 && ( // Check if there are *any* past appointments before showing the section
							<div className="mb-8">
								<div
									className="flex justify-between items-center cursor-pointer p-3 rounded-md border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									onClick={() => setShowPast(!showPast)}
								>
									<div className="flex items-center gap-3">
										<Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
										<span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
											Passés
										</span>
										<span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-gray-100 bg-gray-500 dark:bg-gray-700 rounded-full">
											{pastAppointments.length}
										</span>
									</div>
									<ChevronDown
										className={`h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
											showPast ? "" : "-rotate-90"
										}`}
									/>
								</div>
								{showPast && (
									<div className="border-l-4 border-gray-400 pl-4 ml-[1px] py-4 bg-white dark:bg-gray-800 rounded-b-md shadow-sm space-y-6">
										{/* Filter by Year - Placed Inside */}
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 px-2 pt-2">
											<p className="text-sm font-medium text-gray-600 whitespace-nowrap">
												Filtrer par année :
											</p>
											<Select
												value={
													selectedPastYear
														? selectedPastYear.toString()
														: "all"
												}
												onValueChange={(value) =>
													setSelectedPastYear(
														value === "all"
															? undefined
															: parseInt(value)
													)
												}
											>
												<SelectTrigger className="w-full sm:w-36">
													<SelectValue placeholder="Toutes" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														Toutes
													</SelectItem>
													{/* Generate year options dynamically */}
													{Array.from(
														{ length: 10 },
														(_, i) =>
															new Date().getFullYear() -
															i
													).map((year) => (
														<SelectItem
															key={year}
															value={year.toString()}
														>
															{year}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{/* Message indicating results for the selected year */}
											{selectedPastYear !== undefined && (
												<p
													className={`text-sm font-medium mt-2 sm:mt-0 sm:ml-4 ${
														filteredPastAppointmentsByYear.length >
														0
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{
														filteredPastAppointmentsByYear.length
													}{" "}
													rendez-vous trouvés pour{" "}
													{selectedPastYear}
												</p>
											)}
										</div>

										{/* Display grouped past appointments */}
										{Object.keys(groupedPastAppointments)
											.length > 0 ? (
											Object.entries(
												groupedPastAppointments
											).map(
												(
													[monthYear, days],
													monthIndex
												) => (
													<div key={monthYear}>
														<h3
															className={`text-xl font-semibold text-amber-500 mb-4 ${
																monthIndex > 0
																	? "mt-6"
																	: ""
															}`}
														>
															{monthYear}
														</h3>
														<div className="space-y-6">
															{Object.entries(
																days
															).map(
																([
																	dateStr,
																	appointmentsForDate,
																]) => {
																	const formattedDate =
																		format(
																			new Date(
																				dateStr
																			),
																			"EEEE d",
																			{
																				locale: fr,
																			}
																		);
																	return (
																		<div
																			key={
																				dateStr
																			}
																		>
																			<h4 className="text-md font-medium text-primary mb-3">
																				{
																					formattedDate
																				}
																			</h4>
																			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
																				{appointmentsForDate.map(
																					(
																						appointment
																					) => (
																						<AppointmentCard
																							key={
																								appointment.id
																							}
																							appointment={
																								appointment
																							}
																							patient={getPatientById(
																								appointment.patientId
																							)}
																							onEdit={() =>
																								(window.location.href = `/appointments/${appointment.id}/edit`)
																							}
																							onCancel={() =>
																								setAppointmentToCancel(
																									appointment
																								)
																							}
																							// Add a visual cue for past appointments if needed inside the card
																						/>
																					)
																				)}
																			</div>
																		</div>
																	);
																}
															)}
														</div>
													</div>
												)
											)
										) : (
											// Message if no past appointments match the year filter
											<div className="text-center py-8 text-gray-500">
												<p>
													Aucun rendez-vous passé
													trouvé{" "}
													{selectedPastYear
														? `pour l'année ${selectedPastYear}`
														: ""}
													.
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						)}
						{/* --- Overall Empty State --- */}
						{!loading &&
							filteredAppointments.length === 0 && ( // Check based on filtered list, not individual categories
								<div className="text-center py-16 bg-gray-50 rounded-lg mt-8 border border-dashed">
									<CalendarX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-xl font-semibold text-gray-700">
										Aucun rendez-vous trouvé
									</h3>
									<p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
										{searchQuery || statusFilter !== "all"
											? "Aucun rendez-vous ne correspond à vos critères de recherche ou de filtrage."
											: "Vous n'avez pas encore de rendez-vous."}
									</p>
									<Button asChild>
										<Link to="/appointments/new">
											<Plus className="mr-2 h-4 w-4" />{" "}
											Créer un rendez-vous
										</Link>
									</Button>
								</div>
							)}
					</>
				)}
			</div>

			{/* --- Cancel Confirmation Dialog --- */}
			<Dialog
				open={!!appointmentToCancel}
				onOpenChange={(isOpen) =>
					!isOpen && setAppointmentToCancel(null)
				} // Close dialog on overlay click or Escape key
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmer l'annulation</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir annuler ce rendez-vous ?
							Cette action est irréversible.
						</DialogDescription>
					</DialogHeader>
					{appointmentToCancel && ( // Render details only if appointmentToCancel exists
						<div className="py-4 space-y-1 border-t border-b my-4">
							<p className="text-sm font-medium text-gray-800">
								Patient :{" "}
								<span className="font-normal text-gray-600">
									{
										getPatientById(
											appointmentToCancel.patientId
										)?.firstName
									}{" "}
									{
										getPatientById(
											appointmentToCancel.patientId
										)?.lastName
									}
								</span>
							</p>
							<p className="text-sm font-medium text-gray-800">
								Date :{" "}
								<span className="font-normal text-gray-600">
									{format(
										new Date(appointmentToCancel.date),
										"EEEE d MMMM yyyy 'à' HH:mm",
										{ locale: fr }
									)}
								</span>
							</p>
							<p className="text-sm font-medium text-gray-800">
								Motif :{" "}
								<span className="font-normal text-gray-600">
									{appointmentToCancel.reason}
								</span>
							</p>
						</div>
					)}
					<DialogFooter className="gap-2 sm:gap-0">
						{" "}
						{/* Added gap for mobile */}
						<Button
							variant="outline"
							onClick={() => setAppointmentToCancel(null)}
						>
							Retour
						</Button>
						<Button
							variant="destructive"
							onClick={handleCancelAppointment}
						>
							Confirmer l'annulation
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Layout>
	);
};

export default AppointmentsPage;
