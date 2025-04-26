import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentCard } from "@/components/appointment-card";
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
import { useLocation } from "react-router-dom";

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
	const [showToday, setShowToday] = useState(true); // "Aujourd'hui" section is open by default
	const [showFuture, setShowFuture] = useState(false);

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
				toast.error(
					"Impossible de charger les données. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const getPatientById = (patientId: number) => {
		return patients.find((patient) => patient.id === patientId);
	};

	const getFilteredAppointments = () => {
		return appointments
			.filter((appointment) => {
				// Status filter
				if (
					statusFilter !== "all" &&
					appointment.status !== statusFilter
				) {
					return false;
				}

				// Search query
				const patient = getPatientById(appointment.patientId);
				if (!patient) return true;
				const fullName =
					`${patient.firstName} ${patient.lastName}`.toLowerCase();
				const searchLower = searchQuery.toLowerCase();
				return (
					searchQuery === "" ||
					fullName.includes(searchLower) ||
					appointment.reason.toLowerCase().includes(searchLower)
				);
			})
			.sort(
				(a, b) =>
					new Date(b.date).getTime() - new Date(a.date).getTime()
			);
	};

	const groupAppointmentsByDate = (appointments: Appointment[]) => {
		const grouped: Record<string, Appointment[]> = {};
		appointments.forEach((appointment) => {
			const date = format(new Date(appointment.date), "yyyy-MM-dd");
			if (!grouped[date]) {
				grouped[date] = [];
			}
			grouped[date].push(appointment);
		});
		return grouped;
	};

	const handleCancelAppointment = async () => {
		if (!appointmentToCancel) return;
		try {
			await api.updateAppointment(appointmentToCancel.id, {
				status: "CANCELED",
			});

			// Update local state and force refresh from server
			setAppointments((prevAppointments) =>
				prevAppointments.map((app) =>
					app.id === appointmentToCancel.id
						? {
								...app,
								status: "CANCELED",
						  }
						: app
				)
			);
			toast.success("Rendez-vous annulé avec succès");

			// Force a refresh after cancel operation
			setRefreshKey((prev) => prev + 1);
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			toast.error(
				"Une erreur est survenue lors de l'annulation du rendez-vous"
			);
		} finally {
			setAppointmentToCancel(null);
		}
	};

	// Categorize appointments by past, today, future
	const categorizeAppointments = (appointments: Appointment[]) => {
		const todayStr = format(new Date(), "yyyy-MM-dd");
		const futureAppointments = [];
		const todayAppointments = [];
		const pastAppointments = [];

		appointments.forEach((appointment) => {
			const appointmentDateStr = format(
				new Date(appointment.date),
				"yyyy-MM-dd"
			);
			if (appointmentDateStr < todayStr) {
				pastAppointments.push(appointment);
			} else if (appointmentDateStr === todayStr) {
				todayAppointments.push(appointment);
			} else {
				futureAppointments.push(appointment);
			}
		});

		return { pastAppointments, todayAppointments, futureAppointments };
	};

	const filteredAppointments = getFilteredAppointments();
	const { pastAppointments, todayAppointments, futureAppointments } =
		categorizeAppointments(filteredAppointments);
	const groupedPastAppointments = groupAppointmentsByDate(pastAppointments);
	const groupedTodayAppointments = groupAppointmentsByDate(todayAppointments);
	const groupedFutureAppointments =
		groupAppointmentsByDate(futureAppointments);

	return (
		<Layout>
			<div className="flex flex-col min-h-full">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Calendar className="h-8 w-8 text-purple-600" />
						Rendez-vous
					</h1>

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setLoading(true);
								setRefreshKey((prev) => prev + 1);
							}}
						>
							Actualiser
						</Button>

						<Button asChild>
							<Link to="/appointments/new">
								<Plus className="mr-2 h-4 w-4" /> Nouveau
								rendez-vous
							</Link>
						</Button>
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher un patient, motif..."
							className="pl-9"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="w-full md:w-64 flex items-center">
						<Filter className="mr-2 h-4 w-4 text-muted-foreground" />
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
						>
							<SelectTrigger>
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

				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">
								Chargement des rendez-vous...
							</p>
						</div>
					</div>
				) : (
					<>
						{/* Display Past Appointments */}
						{Object.keys(groupedPastAppointments).length > 0 && (
							<div className="mt-2">
								<h2
									className="text-lg font-bold mb-4 bg-gray-200 text-gray-800 p-2 rounded-lg cursor-pointer"
									onClick={() => setShowPast(!showPast)}
								>
									{showPast ? "▼" : "►"} Rendez-vous passés
								</h2>
								{showPast && (
									<div>
										{Object.entries(
											groupedPastAppointments
										).map(
											([
												dateStr,
												appointmentsForDate,
											]) => {
												const formattedDate = format(
													new Date(dateStr),
													"EEEE d MMMM yyyy",
													{
														locale: fr,
													}
												);
												return (
													<div key={dateStr}>
														<h3 className="text-lg font-medium mt-4 mb-2">
															{formattedDate}
														</h3>
														<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
																		onEdit={() => {
																			window.location.href = `/appointments/${appointment.id}/edit`;
																		}}
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
								)}
							</div>
						)}

						{/* Display Today Appointments */}
						{Object.keys(groupedTodayAppointments).length > 0 && (
							<div className="mt-2">
								<h2
									className="text-lg font-bold mb-4 bg-lime-400 text-black p-2 rounded-lg cursor-pointer"
									onClick={() => setShowToday(!showToday)}
								>
									{showToday ? "▼" : "►"} Rendez-vous
									aujourd'hui
								</h2>
								{showToday && (
									<div>
										{Object.entries(
											groupedTodayAppointments
										).map(
											([
												dateStr,
												appointmentsForDate,
											]) => {
												const formattedDate = format(
													new Date(dateStr),
													"EEEE d MMMM yyyy",
													{
														locale: fr,
													}
												);
												return (
													<div key={dateStr}>
														<h3 className="text-lg font-medium">
															{formattedDate}
														</h3>
														<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
																		onEdit={() => {
																			window.location.href = `/appointments/${appointment.id}/edit`;
																		}}
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
								)}
							</div>
						)}

						{/* Display Future Appointments */}
						{Object.keys(groupedFutureAppointments).length > 0 && (
							<div className="mt-2">
								<h2
									className="text-lg font-bold mb-4 bg-blue-200 text-blue-800 p-2 rounded-lg cursor-pointer"
									onClick={() => setShowFuture(!showFuture)}
								>
									{showFuture ? "▼" : "►"} Rendez-vous à venir
								</h2>
								{showFuture && (
									<div>
										{Object.entries(
											groupedFutureAppointments
										).map(
											([
												dateStr,
												appointmentsForDate,
											]) => {
												const formattedDate = format(
													new Date(dateStr),
													"EEEE d MMMM yyyy",
													{
														locale: fr,
													}
												);
												return (
													<div key={dateStr}>
														<h3 className="text-lg font-medium">
															{formattedDate}
														</h3>
														<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
																		onEdit={() => {
																			window.location.href = `/appointments/${appointment.id}/edit`;
																		}}
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
								)}
							</div>
						)}

						{/* If no appointments found */}
						{Object.keys(groupedPastAppointments).length === 0 &&
							Object.keys(groupedTodayAppointments).length ===
								0 &&
							Object.keys(groupedFutureAppointments).length ===
								0 && (
								<div className="text-center py-12 bg-muted/30 rounded-lg">
									<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 text-purple-500" />
									<h3 className="text-xl font-medium">
										Aucun rendez-vous trouvé
									</h3>
									<p className="text-muted-foreground mt-2 mb-6">
										Aucun rendez-vous ne correspond à vos
										critères de recherche.
									</p>
								</div>
							)}
					</>
				)}
			</div>

			<Dialog
				open={!!appointmentToCancel}
				onOpenChange={() => setAppointmentToCancel(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Annuler le rendez-vous</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir annuler ce rendez-vous ?
							Cette action ne peut pas être annulée.
						</DialogDescription>
					</DialogHeader>
					{appointmentToCancel && (
						<div className="py-2">
							<p className="font-medium">
								Détails du rendez-vous :
							</p>
							<p className="text-sm text-muted-foreground">
								{format(
									new Date(appointmentToCancel.date),
									"EEEE d MMMM yyyy 'à' HH:mm",
									{
										locale: fr,
									}
								)}
							</p>
							<p className="text-sm text-muted-foreground">
								Patient :{" "}
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
							</p>
							<p className="text-sm text-muted-foreground">
								Motif : {appointmentToCancel.reason}
							</p>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setAppointmentToCancel(null)}
						>
							Annuler
						</Button>
						<Button
							variant="destructive"
							onClick={handleCancelAppointment}
						>
							Confirmez l'annulation
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Layout>
	);
};

export default AppointmentsPage;
