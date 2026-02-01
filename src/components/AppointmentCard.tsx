import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import {
	formatAppointmentDate,
	formatAppointmentTime,
} from "@/utils/date-utils";
import { differenceInYears, parseISO } from "date-fns";
import {
	Baby,
	Calendar,
	Clock,
	Edit,
	FileText,
	MessageSquare,
	X,
	Eye,
	User,
	Stethoscope,
	ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { AppointmentBadgeEditor } from "@/components/patients/detail/AppointmentBadgeEditor";

interface AppointmentCardProps {
	appointment: Appointment;
	patient?: Patient;
	onEdit?: () => void;
	onCancel?: () => void;
	onStatusChange?: (
		appointmentId: number,
		status: AppointmentStatus,
	) => Promise<void>;
}

export function AppointmentCard({
	appointment,
	patient,
	onEdit,
	onCancel,
	onStatusChange,
}: AppointmentCardProps) {
	// Utiliser start si disponible, sinon utiliser date pour la compatibilité
	const dateField = appointment.start || appointment.date;
	const formattedDate = formatAppointmentDate(dateField, "EEEE d MMMM yyyy");
	const formattedTime = formatAppointmentTime(dateField);
	const isMinor = patient?.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate)) < 18
		: false;

	// Récupérer les factures existantes pour ce rendez-vous
	const { data: existingInvoices } = useQuery({
		queryKey: ["invoices", "appointment", appointment.id],
		queryFn: () => api.getInvoicesByAppointmentId(appointment.id),
		enabled: appointment.status === "COMPLETED",
	});

	const existingInvoice = existingInvoices?.[0];

	const handleStatusChange = async (status: AppointmentStatus) => {
		if (onStatusChange) {
			await onStatusChange(appointment.id, status);
		}
	};

	const getStatusConfig = (status: AppointmentStatus) => {
		switch (status) {
			case "SCHEDULED":
				return {
					label: "Planifié",
					className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
					dotColor: "bg-blue-500",
				};
			case "COMPLETED":
				return {
					label: "Terminé",
					className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700",
					dotColor: "bg-emerald-500",
				};
			case "CANCELED":
				return {
					label: "Annulé",
					className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
					dotColor: "bg-red-500",
				};
			case "RESCHEDULED":
				return {
					label: "Reporté",
					className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700",
					dotColor: "bg-amber-500",
				};
			case "NO_SHOW":
				return {
					label: "Absent",
					className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-700",
					dotColor: "bg-slate-500",
				};
			default:
				return {
					label: status,
					className: "bg-gray-100 text-gray-800 border-gray-200",
					dotColor: "bg-gray-500",
				};
		}
	};

	const statusConfig = getStatusConfig(appointment.status);

	return (
		<div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
			{/* Header avec gradient subtil */}
			<div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 min-w-0 flex-1">
						{/* Avatar patient */}
						<div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
							{patient ? (
								<span className="text-white font-semibold text-sm">
									{patient.firstName?.[0]}{patient.lastName?.[0]}
								</span>
							) : (
								<User className="h-5 w-5 text-white" />
							)}
						</div>
						{/* Nom patient */}
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								{patient ? (
									<Link
										to={`/patients/${patient.id}`}
										className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
									>
										{patient.firstName} {patient.lastName}
									</Link>
								) : (
									<span className="font-semibold text-gray-900 dark:text-gray-100">
										Patient #{appointment.patientId}
									</span>
								)}
								{isMinor && (
									<Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
										<Baby className="h-3 w-3 mr-1" />
										Mineur
									</Badge>
								)}
							</div>
						</div>
					</div>
					{/* Badge statut */}
					{onStatusChange ? (
						<AppointmentBadgeEditor
							currentStatus={appointment.status}
							onStatusChange={handleStatusChange}
						/>
					) : (
						<Badge variant="outline" className={`text-xs font-medium ${statusConfig.className}`}>
							<span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}></span>
							{statusConfig.label}
						</Badge>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="px-4 py-3 space-y-3">
				{/* Date et heure - ligne principale */}
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4 text-blue-500" />
						<span className="text-gray-700 dark:text-gray-300 capitalize">{formattedDate}</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-purple-500" />
						<span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formattedTime}</span>
					</div>
				</div>

				{/* Motif */}
				{appointment.reason && (
					<div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
						<Stethoscope className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
						<span className="text-sm text-gray-600 dark:text-gray-400">{appointment.reason}</span>
					</div>
				)}

				{/* Traitement en cours */}
				{patient?.currentTreatment && (
					<div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
						<FileText className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
						<div className="text-sm">
							<span className="text-amber-700 dark:text-amber-300 font-medium">Traitement : </span>
							<span className="text-amber-600 dark:text-amber-400">{patient.currentTreatment}</span>
						</div>
					</div>
				)}

				{/* Notes de séance */}
				{appointment.notes && (
					<div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
						<div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
							<MessageSquare className="h-3.5 w-3.5" />
							Notes
						</div>
						<p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 whitespace-pre-line">
							{appointment.notes}
						</p>
					</div>
				)}
			</div>

			{/* Footer avec actions */}
			<div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					{/* Lien vers patient */}
					{patient && (
						<Link
							to={`/patients/${patient.id}`}
							className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
						>
							Voir le dossier
							<ChevronRight className="h-3 w-3" />
						</Link>
					)}
					{!patient && <div />}

					{/* Actions */}
					<div className="flex items-center gap-2">
						{/* Si la séance est terminée */}
						{appointment.status === "COMPLETED" && (
							<>
								{existingInvoice ? (
									<Button variant="outline" size="sm" className="h-8 text-xs" asChild>
										<Link to={`/invoices/${existingInvoice.id}`}>
											<Eye className="h-3.5 w-3.5 mr-1" />
											Facture
										</Link>
									</Button>
								) : (
									<Button variant="outline" size="sm" className="h-8 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700" asChild>
										<Link to={`/invoices/new?appointmentId=${appointment.id}`}>
											<FileText className="h-3.5 w-3.5 mr-1" />
											Facturer
										</Link>
									</Button>
								)}
							</>
						)}

						{/* Pour les séances à venir */}
						{(appointment.status === "SCHEDULED" || appointment.status === "RESCHEDULED") && (
							<>
								<Button variant="outline" size="sm" className="h-8 text-xs" asChild>
									<Link to={`/appointments/${appointment.id}/edit`}>
										<Edit className="h-3.5 w-3.5 mr-1" />
										Modifier
									</Link>
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-800"
									onClick={onCancel}
								>
									<X className="h-3.5 w-3.5 mr-1" />
									Annuler
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
