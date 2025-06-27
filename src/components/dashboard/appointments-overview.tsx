import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { api } from "@/services/api";
import { Appointment, DashboardData } from "@/types";
import {
	differenceInYears,
	format,
	isToday,
	isTomorrow,
	parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Baby, Calendar, Clock, FileText, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
	const [nextAppointment, setNextAppointment] = useState<Appointment | null>(
		null
	);
	const [patients, setPatients] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
	const navigate = useNavigate();

	// Utiliser le hook pour la mise à jour automatique des statuts
	useAppointmentStatusUpdate({
		appointments: allAppointments,
		onAppointmentsUpdate: (updatedAppointments) => {
			setAllAppointments(updatedAppointments);
			// Refiltrer les rendez-vous après mise à jour
			filterAndSetAppointments(updatedAppointments);
		},
	});

	const filterAndSetAppointments = (appointmentsData: Appointment[]) => {
		// Filtrer pour garder seulement les rendez-vous à venir (incluant les COMPLETED)
		const now = new Date();
		const filteredAppointments = appointmentsData
			.filter((appointment) => {
				const appointmentDate = parseISO(appointment.date);
				// Inclure maintenant aussi les rendez-vous avec le statut SCHEDULED ou COMPLETED
				return (
					appointmentDate >= now &&
					(appointment.status === "SCHEDULED" ||
						appointment.status === "COMPLETED")
				);
			})
			.sort(
				(a, b) =>
					parseISO(a.date).getTime() - parseISO(b.date).getTime()
			);

		// Séparer le prochain rendez-vous des autres rendez-vous à venir
		let nextApp = null;
		let otherAppointments = [...filteredAppointments];

		if (filteredAppointments.length > 0) {
			nextApp = filteredAppointments[0];
			// Garder les 4 rendez-vous suivants (sans le premier qui est affiché séparément)
			otherAppointments = filteredAppointments.slice(1, 5);
		}

		setNextAppointment(nextApp);
		setUpcomingAppointments(otherAppointments);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Récupérer les rendez-vous et les patients
				const [appointmentsData, patientsData] = await Promise.all([
					api.getAppointments(),
					api.getPatients(),
				]);

				setAllAppointments(appointmentsData);
				setPatients(patientsData);
				filterAndSetAppointments(appointmentsData);
				setLoading(false);
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des rendez-vous:",
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

	const isChild = (patient: any) => {
		if (!patient?.birthDate) return false;
		const birthDate = parseISO(patient.birthDate);
		const age = differenceInYears(new Date(), birthDate);
		return age < 12;
	};

	const handleAppointmentClick = (appointmentId: number) => {
		try {
			// Fix: Assurons-nous que l'ID est un nombre valide
			if (!appointmentId || isNaN(appointmentId)) {
				toast.error("ID de rendez-vous invalide");
				return;
			}

			console.log(`Navigation vers le rendez-vous #${appointmentId}`);

			// Naviguer vers la page d'édition du rendez-vous avec l'ID
			navigate(`/appointments/${appointmentId}/edit`);

			// Afficher un toast pour confirmer l'action
			toast.info(
				`Chargement des détails du rendez-vous #${appointmentId}`
			);
		} catch (error) {
			console.error("Erreur lors de la navigation:", error);
			toast.error("Impossible d'afficher les détails de ce rendez-vous");
		}
	};

	const handleCreateInvoice = (appointmentId: number) => {
		try {
			if (!appointmentId || isNaN(appointmentId)) {
				toast.error("ID de rendez-vous invalide");
				return;
			}

			console.log(
				`Création d'une facture pour le rendez-vous #${appointmentId}`
			);

			// Naviguer vers la page de création de facture avec l'ID du rendez-vous
			navigate(`/invoices/new?appointmentId=${appointmentId}`);

			toast.info("Ouverture du formulaire de création de facture");
		} catch (error) {
			console.error("Erreur lors de la création de facture:", error);
			toast.error("Impossible de créer la facture pour ce rendez-vous");
		}
	};

	// Fonction pour formater la date du prochain rendez-vous
	const formatNextAppointmentDate = (dateString: string) => {
		const date = parseISO(dateString);
		if (isToday(date)) {
			return "aujourd'hui";
		} else if (isTomorrow(date)) {
			return "demain";
		} else {
			return format(date, "EEEE d MMMM", { locale: fr });
		}
	};

	// Use default value if data.appointmentsToday is undefined
	const appointmentsToday = data?.appointmentsToday || 0;

	// Render the appointment card
	const renderAppointmentItem = (
		appointment: Appointment,
		isHighlighted = false,
		isLastItem = false
	) => {
		const patient = getPatientById(appointment.patientId);
		const appointmentDate = parseISO(appointment.date);

		return (
			<div
				key={appointment.id}
				className={`flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors relative ${
					isHighlighted ? "bg-blue-50 dark:bg-blue-900/10" : ""
				} ${!isLastItem ? "border-b" : ""}`}
			>
				<div className="flex-shrink-0 mr-4 flex items-center space-x-2">
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
						className={`font-medium hover:underline text-base truncate inline-flex items-center ${
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
						{isChild(patient) && (
							<Baby className="h-5 w-5 text-emerald-400 ml-1">
								<title>Enfant</title>
							</Baby>
						)}
					</Link>

					<p className="text-sm text-muted-foreground truncate">
						{appointment.reason}
					</p>
					<div className="mt-2 flex flex-wrap gap-3">
						<div className="flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
							<Clock className="h-3 w-3 text-blue-500 mr-1" />
							<span>{format(appointmentDate, "HH:mm")}</span>
						</div>
						<div className="flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
							<Calendar className="h-3 w-3 text-purple-500 mr-1" />
							<span>
								{format(appointmentDate, "dd MMM yyyy", {
									locale: fr,
								})}
							</span>
						</div>
						{isToday(appointmentDate) && (
							<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-normal">
								Aujourd'hui
							</Badge>
						)}
						{isHighlighted && !isToday(appointmentDate) && (
							<Badge className="bg-blue-100 hover:bg-blue-200 transition-colors duration-150 ease-in text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-normal">
								Prochain
							</Badge>
						)}
						{appointment.status === "COMPLETED" && (
							<Badge className="bg-amber-100 hover:bg-amber-200 transition-colors duration-150 ease-in text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-normal">
								Terminé
							</Badge>
						)}
					</div>
				</div>
				<div className="ml-2 flex gap-2">
					<button
						onClick={() => handleAppointmentClick(appointment.id)}
						className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-sky-700 dark:hover:bg-sky-800 dark:text-white text-blue-600 rounded text-xs font-medium transition-colors"
					>
						Détails
					</button>
					{appointment.status === "COMPLETED" && (
						<button
							onClick={() => handleCreateInvoice(appointment.id)}
							className="px-3 py-1 bg-green-50 hover:bg-green-100 dark:bg-green-700 dark:hover:bg-green-800 dark:text-white text-green-600 rounded text-xs font-medium transition-colors flex items-center gap-1"
						>
							<FileText className="h-3 w-3" />
							Facture
						</button>
					)}
				</div>
			</div>
		);
	};

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
						{(nextAppointment &&
						isToday(parseISO(nextAppointment.date))
							? 1
							: 0) +
							upcomingAppointments.filter((app) =>
								isToday(parseISO(app.date))
							).length}{" "}
						aujourd'hui
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{loading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : nextAppointment === null &&
				  upcomingAppointments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
						<p>Aucune séance à venir</p>
					</div>
				) : (
					<div>
						{nextAppointment &&
							renderAppointmentItem(
								nextAppointment,
								true,
								upcomingAppointments.length === 0
							)}

						{upcomingAppointments.map((appointment, index) => {
							const isLastItem =
								index === upcomingAppointments.length - 1;
							return renderAppointmentItem(
								appointment,
								false,
								isLastItem
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
