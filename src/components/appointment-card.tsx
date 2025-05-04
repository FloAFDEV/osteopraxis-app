import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Calendar, FileText, Edit, X } from "lucide-react";
import { Appointment, Patient } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
	formatAppointmentDate,
	formatAppointmentTime,
} from "@/utils/date-utils";

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
	const formattedDate = formatAppointmentDate(
		appointment.date,
		"EEEE d MMMM yyyy"
	);
	const formattedTime = formatAppointmentTime(appointment.date);
	const navigate = useNavigate();

	const getStatusBadge = (status: Appointment["status"]) => {
		switch (status) {
			case "SCHEDULED":
				return <Badge className="bg-blue-500">Planifié</Badge>;
			case "COMPLETED":
				return <Badge className="bg-green-500">Terminé</Badge>;
			case "CANCELED":
				return <Badge className="bg-red-500">Annulé</Badge>;
			case "RESCHEDULED":
				return <Badge className="bg-amber-500">Reporté</Badge>;
			default:
				return null;
		}
	};

	return (
		<Card className="overflow-hidden hover-scale">
			<CardContent className="p-6">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h3 className="text-lg font-medium">
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
						</h3>
					</div>
					{getStatusBadge(appointment.status)}
				</div>
				<div className="space-y-2">
					{/* Affichage du traitement en cours */}
					{patient && (
						<div className="flex items-center gap-2 text-sm">
							<FileText className="h-4 w-4 text-primary" />
							<span>
								Traitement en cours :{" "}
								{patient.currentTreatment
									? patient.currentTreatment
									: "Aucun traitement en cours"}
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
					<p className="text-muted-foreground">
						Raison de la séance : {appointment.reason}
					</p>
				</div>
			</CardContent>
			<CardFooter className="px-6 py-4 bg-muted/20 flex flex-wrap justify-end gap-2">
				{/* Si la séance est terminée, on montre le bouton pour accéder/créer la Note d'honoraire */}
				{appointment.status === "COMPLETED" && (
					<>
						<Button variant="outline" size="sm" asChild>
							<Link
								to={`/invoices/new?appointmentId=${appointment.id}`}
							>
								<FileText className="h-4 w-4 mr-1" />
								Créer une note d'honoraire
							</Link>
						</Button>
					</>
				)}

				{/* Pour les séances à venir, on montre les boutons modifier et annuler */}
				{appointment.status === "SCHEDULED" && (
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
