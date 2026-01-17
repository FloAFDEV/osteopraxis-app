
import { Button } from "@/components/ui/button";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { formatAppointmentTime } from "@/utils/date-utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Edit, X } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { OptimizedAppointmentStatusDropdown } from "./OptimizedAppointmentStatusDropdown";
import { useEffect, useState } from "react";

interface UpcomingAppointmentsTabProps {
	patient: Patient;
	appointments: Appointment[];
	onCancelAppointment: (appointmentId: number) => Promise<void>;
	onStatusChange: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
}

export function UpcomingAppointmentsTab({
	patient,
	appointments,
	onCancelAppointment,
	onStatusChange
}: UpcomingAppointmentsTabProps) {
	const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);

	// Sync with props appointments
	useEffect(() => {
		setLocalAppointments(appointments);
	}, [appointments]);

	useEffect(() => {
		const handleAppointmentCreated = (event: any) => {
				const newAppointment = event.detail;
			
			// Ajouter immédiatement le nouvel appointment à la liste locale
			if (newAppointment && newAppointment.patientId === patient.id) {
				setLocalAppointments(prev => [...prev, newAppointment]);
			}
		};

		window.addEventListener('appointment-created', handleAppointmentCreated);
		return () => window.removeEventListener('appointment-created', handleAppointmentCreated);
	}, [patient.id]);

	return (
		<div className="space-y-4 mt-6">
			{localAppointments.length === 0 ? (
				<div className="text-center py-8">
					<Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-xl font-medium">
						Aucune séance à venir
					</h3>
					<p className="text-muted-foreground m-2">
						Ce patient n'a pas de séance planifiée.
					</p>
					<p className="text-sm text-muted-foreground">
						Utilisez l'onglet "Nouvelle séance" pour en planifier une.
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					{localAppointments.map((appointment) => (
						<div key={appointment.id} className="border rounded-lg p-4">
							<div className="flex justify-between items-center mb-2">
								<div>
									<h3 className="font-medium">
										{format(
											new Date(appointment.date),
											"EEEE dd MMMM yyyy",
											{ locale: fr }
										)}
									</h3>
									<p className="text-sm text-muted-foreground">
										{formatAppointmentTime(appointment.date)}
									</p>
								</div>
								<OptimizedAppointmentStatusDropdown
									status={appointment.status as AppointmentStatus}
									onStatusChange={(status) => onStatusChange(appointment.id, status)}
								/>
							</div>
							<div className="mt-1 text-sm">
								<span className="font-medium">Motif:</span>{" "}
								{appointment.reason}
							</div>
							{appointment.notes && (
								<div className="mt-2 pl-3 border-l-2 border-purple-200">
									<p className="text-sm text-muted-foreground italic whitespace-pre-line">
										{appointment.notes}
									</p>
								</div>
							)}
							<div className="mt-4 flex justify-end gap-2">
								<Button variant="outline" size="sm" asChild>
									<RouterLink to={`/appointments/${appointment.id}/edit`}>
										<Edit className="mr-1 h-4 w-4" />
										Modifier
									</RouterLink>
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => onCancelAppointment(appointment.id)}
								>
									<X className="mr-1 h-4 w-4" />
									Annuler
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
