import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface AppointmentCardProps {
	appointment: Appointment;
	patient?: Patient;
	onEdit?: () => void;
	onCancel?: () => void;
}

export function AppointmentCard({
	appointment,
	patient,
	onEdit,
	onCancel,
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

	const getStatusBadge = (status: AppointmentStatus) => {
		switch (status) {
			case "SCHEDULED":
				return <Badge className="bg-blue-500">Planifié</Badge>;
			case "COMPLETED":
				return <Badge className="bg-green-500">Terminé</Badge>;
			case "CANCELED":
				return <Badge className="bg-rose-500">Annulé</Badge>;
			case "RESCHEDULED":
				return <Badge className="bg-amber-500">Reporté</Badge>;
			case "NO_SHOW":
				return (
					<Badge className="bg-red-500">
						Ne s'est pas présenté(e)
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="overflow-hidden hover-scale">
			<CardContent className="p-6">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h3 className="text-lg font-medium flex items-center gap-2">
							{patient ? (
								<Link
									to={`/patients/${patient.id}`}
									className="hover:text-primary transition-colors"
								>
									{patient.firstName} {patient.lastName}
								</Link>
							) : (
								`Patient #${appointment.patientId}`
							)}
							{isMinor && (
								<Baby className="h-4 w-4 text-emerald-400" />
							)}
							{isMinor && (
								<span className="ml-1 text-xs text-gray-600">
									Mineur
								</span>
							)}
						</h3>
					</div>
					{getStatusBadge(appointment.status)}
				</div>
				<div className="space-y-2">
					{/* Affichage du traitement en cours */}
					{patient && patient.currentTreatment && (
						<div className="flex items-center gap-2 text-sm">
							<FileText className="h-4 w-4 text-primary" />
							<span>
								Traitement en cours : {patient.currentTreatment}
							</span>
						</div>
					)}

					{/* Affichage du motif */}
					<div className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4 text-primary" />
						<span className="capitalize">{formattedDate}</span>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<Clock className="h-4 w-4 text-primary" />
						<span className="text-red-500 font-semibold">
							{formattedTime}
						</span>
					</div>

					{/* Affichage du Motif de la séance */}
					{appointment.reason && (
						<p className="text-muted-foreground">
							Motif : {appointment.reason}
						</p>
					)}

					{/* Affichage des notes de séance s'il y en a */}
					{appointment.notes && (
						<div className="mt-2 pt-2 border-t">
							<div className="flex items-center gap-2 text-sm font-medium mb-1">
								<MessageSquare className="h-4 w-4 text-primary" />
								<span>Notes de séance :</span>
							</div>
							<p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
								{appointment.notes}
							</p>
						</div>
					)}
				</div>
			</CardContent>
			<CardFooter className="px-6 py-4 bg-muted/20 flex flex-wrap justify-end gap-2">
				{/* Si la séance est terminée, on montre le bouton pour accéder/créer la Note d'honoraire */}
				{appointment.status === "COMPLETED" && (
					<>
						{existingInvoice ? (
							<Button variant="outline" size="sm" asChild>
								<Link to={`/invoices/${existingInvoice.id}`}>
									<Eye className="h-4 w-4 mr-1" />
									Consulter la facture
								</Link>
							</Button>
						) : (
							<Button variant="outline" size="sm" asChild>
								<Link
									to={`/invoices/new?appointmentId=${appointment.id}`}
								>
									<FileText className="h-4 w-4 mr-1" />
									Créer une note d'honoraire
								</Link>
							</Button>
						)}
					</>
				)}

				{/* Pour les séances à venir, on montre les boutons modifier et annuler */}
				{(appointment.status === "SCHEDULED" ||
					appointment.status === "RESCHEDULED") && (
					<>
						<Button variant="outline" size="sm" asChild>
							<Link to={`/appointments/${appointment.id}/edit`}>
								<Edit className="h-4 w-4 mr-1" />
								Modifier
							</Link>
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={onCancel}
						>
							<X className="h-4 w-4 mr-1" />
							Annuler
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	);
}
