
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { format, isToday, parseISO, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types";
import { toast } from "sonner";
import { formatAppointmentDate } from "@/utils/date-utils";

interface AppointmentsOverviewProps {
	data: DashboardData;
	className?: string;
}

export function AppointmentsOverview({
	data,
	className,
}: AppointmentsOverviewProps) {
	const [upcomingAppointments, setUpcomingAppointments] = useState<
		Appointment[]
	>([]);
	const [patients, setPatients] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Récupérer les Séance et les patients
				const [appointmentsData, patientsData] = await Promise.all([
					api.getAppointments(),
					api.getPatients(),
				]);

				// Filtrer pour garder seulement les Séance à venir
				const now = new Date();
				const filteredAppointments = appointmentsData
					.filter((appointment) => {
						const appointmentDate = parseISO(appointment.date);
						return (
							appointmentDate >= now &&
							appointment.status === "SCHEDULED"
						);
					})
					.sort(
						(a, b) =>
							parseISO(a.date).getTime() -
							parseISO(b.date).getTime()
					)
					.slice(0, 5); // Garder seulement les 5 prochaines séances

				console.log(
					`Appointments for dashboard: ${filteredAppointments.length}`
				);
				setUpcomingAppointments(filteredAppointments);
				setPatients(patientsData);
				setLoading(false);
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des Séance:",
					error
				);
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Obtenir les informations sur un patient par ID
	const getPatientById = (patientId: number) => {
		return patients.find((p) => p.id === patientId);
	};

	const handleAppointmentClick = (appointmentId: number) => {
		try {
			// Fix: Assurons-nous que l'ID est un nombre valide
			if (!appointmentId || isNaN(appointmentId)) {
				toast.error("ID de Séance invalide");
				return;
			}

			console.log(`Navigation vers le Séance #${appointmentId}`);

			// Naviguer vers la page d'édition du Séance avec l'ID
			navigate(`/appointments/${appointmentId}/edit`);

			// Afficher un toast pour confirmer l'action
			toast.info(`Chargement des détails du Séance #${appointmentId}`);
		} catch (error) {
			console.error("Erreur lors de la navigation:", error);
			toast.error("Impossible d'afficher les détails de ce Séance");
		}
	};

	// Use default value if data.appointmentsToday is undefined
	const appointmentsToday = data?.appointmentsToday || 0;

	// Déterminer le prochain rendez-vous (le premier de la liste triée)
	const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
	const nextPatient = nextAppointment ? getPatientById(nextAppointment.patientId) : null;

	return (
		<Card
			className={`${className} shadow-sm hover:shadow-md transition-shadow`}
		>
			<CardHeader className="border-b bg-slate-50 dark:bg-slate-900/50">
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-blue-600" />
						<span>Prochaines séances</span>
					</div>
					<Badge
						variant="outline"
						className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
					>
						{
							upcomingAppointments.filter((app) =>
								isToday(parseISO(app.date))
							).length
						}{" "}
						aujourd'hui
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{loading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : upcomingAppointments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
						<p>Aucune séance à venir</p>
					</div>
				) : (
					<div>
						{/* Section pour le prochain rendez-vous (mis en évidence) */}
						{nextAppointment && (
							<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-700">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center">
										<AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
										<h3 className="font-semibold text-blue-800 dark:text-blue-300">Prochain rendez-vous</h3>
									</div>
									<Badge 
										variant="outline" 
										className={`
											${isToday(parseISO(nextAppointment.date)) 
												? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
												: isTomorrow(parseISO(nextAppointment.date))
													? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
													: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
											}
										`}
									>
										{isToday(parseISO(nextAppointment.date)) 
											? "Aujourd'hui" 
											: isTomorrow(parseISO(nextAppointment.date))
												? "Demain"
												: formatAppointmentDate(nextAppointment.date, "EEEE d MMMM")}
									</Badge>
								</div>
								
								<div className="flex items-center mb-3">
									<div className="flex-shrink-0 mr-3">
										<div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center">
											<User
												className={`h-5 w-5 ${
													nextPatient?.gender === "Femme"
														? "text-pink-500"
														: nextPatient?.gender === "Homme"
														? "text-blue-500"
														: "text-gray-500"
												}`}
											/>
										</div>
									</div>
									<div>
										<Link
											to={`/patients/${nextAppointment.patientId}`}
											className={`font-medium hover:underline text-base ${
												nextPatient?.gender === "Femme"
													? "text-pink-700 dark:text-pink-400"
													: nextPatient?.gender === "Homme"
													? "text-blue-700 dark:text-blue-400"
													: "text-slate-800 dark:text-white"
											}`}
										>
											{nextPatient
												? `${nextPatient.firstName} ${nextPatient.lastName}`
												: `Patient #${nextAppointment.patientId}`}
										</Link>
										<div className="flex items-center text-sm text-blue-700 dark:text-blue-400">
											<Clock className="h-3 w-3 mr-1" />
											{format(parseISO(nextAppointment.date), "HH:mm")} - 
											<Calendar className="h-3 w-3 mx-1" />
											{formatAppointmentDate(nextAppointment.date, "EEEE d MMMM")}
										</div>
									</div>
									<button
										onClick={() => handleAppointmentClick(nextAppointment.id)}
										className="ml-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
									>
										Détails
									</button>
								</div>
								
								<div className="text-sm bg-white dark:bg-slate-800 p-2 rounded border border-blue-100 dark:border-blue-800">
									<span className="font-medium">Motif:</span> {nextAppointment.reason}
								</div>
							</div>
						)}
						
						{/* Liste des autres rendez-vous à venir */}
						{upcomingAppointments.slice(1).map((appointment, index) => {
							const patient = getPatientById(
								appointment.patientId
							);
							const appointmentDate = parseISO(appointment.date);
							const isLastItem =
								index === upcomingAppointments.length - 2; // -2 because we're starting from the second item

							return (
								<div
									key={appointment.id}
									className={`flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors relative ${
										!isLastItem ? "border-b" : ""
									}`}
								>
									<div className="flex-shrink-0 mr-4">
										<div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center">
											<User
												className={`h-6 w-6 ${
													patient?.gender === "Femme"
														? "text-pink-500"
														: patient?.gender === "Homme"
														? "text-blue-500"
														: "text-gray-500"
												}`}
											/>
										</div>
									</div>
									<div className="flex-1 min-w-0">
										<Link
											to={`/patients/${appointment.patientId}`}
											className={`font-medium hover:underline text-base truncate block ${
												patient?.gender === "Femme"
													? "text-pink-700 dark:text-pink-400"
													: patient?.gender === "Homme"
													? "text-blue-700 dark:text-blue-400"
													: "text-slate-800 dark:text-white"
											}`}
										>
											{patient
												? `${patient.firstName} ${patient.lastName}`
												: `Patient #${appointment.patientId}`}
										</Link>
										<p className="text-sm text-muted-foreground truncate">
											{appointment.reason}
										</p>
										<div className="mt-2 flex flex-wrap gap-3">
											<div className="flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
												<Clock className="h-3 w-3 text-blue-500 mr-1" />
												<span>
													{format(
														appointmentDate,
														"HH:mm"
													)}
												</span>
											</div>
											<div className="flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
												<Calendar className="h-3 w-3 text-purple-500 mr-1" />
												<span>
													{format(
														appointmentDate,
														"dd MMM yyyy",
														{ locale: fr }
													)}
												</span>
											</div>
											{isToday(appointmentDate) && (
												<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-normal">
													Aujourd'hui
												</Badge>
											)}
										</div>
									</div>
									<button
										onClick={() =>
											handleAppointmentClick(
												appointment.id
											)
										}
										className="ml-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-sky-700 dark:hover:bg-sky-800 dark:text-white text-blue-600 rounded text-xs font-medium transition-colors"
									>
										Détails
									</button>
								</div>
							);
						})}
						<div className="p-4 bg-slate-50 dark:bg-slate-900/20 text-center">
							<Link
								to="/appointments"
								className="text-blue-600 hover:text-gray-400 text-sm font-medium flex items-center justify-center"
							>
								Voir toutes les séances
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="ml-1"
								>
									<path d="m9 18 6-6-6-6" />
								</svg>
							</Link>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
