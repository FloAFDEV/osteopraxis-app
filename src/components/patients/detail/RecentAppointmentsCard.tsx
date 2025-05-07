
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Appointment, AppointmentStatus } from "@/types";
import { formatAppointmentTime } from "@/utils/date-utils";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { AppointmentStatusDropdown } from "./AppointmentStatusDropdown";

interface RecentAppointmentsCardProps {
	appointments: Appointment[];
	onStatusChange: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
	onNavigateToHistory: () => void;
}

export function RecentAppointmentsCard({
	appointments,
	onStatusChange,
	onNavigateToHistory
}: RecentAppointmentsCardProps) {
	return (
		<Card className="mt-6">
			<CardContent className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-purple-500" />
						Dernières séances et comptes rendus
					</h3>
					<Button variant="ghost" size="sm" onClick={onNavigateToHistory}>
						Voir tout l'historique
					</Button>
				</div>

				{appointments.length === 0 ? (
					<p className="text-center text-muted-foreground py-4">
						Aucune séance passée
					</p>
				) : (
					<div className="space-y-4 max-h-80 overflow-y-auto pr-2">
						{appointments.slice(0, 3).map((appointment) => (
							<div key={appointment.id} className="border-b pb-3 last:border-0">
								<div className="flex justify-between items-center">
									<div className="font-medium">
										{format(new Date(appointment.date), "dd/MM/yyyy")}{" "}
										- {formatAppointmentTime(appointment.date)}
									</div>
									<AppointmentStatusDropdown 
										status={appointment.status as AppointmentStatus}
										onStatusChange={(status) => onStatusChange(appointment.id, status)}
									/>
								</div>
								<div className="text-sm text-muted-foreground mt-1">
									Motif : {appointment.reason}
								</div>
								{appointment.notes && (
									<div className="mt-2 pl-3 border-l-2 border-purple-200">
										<p className="text-sm text-muted-foreground italic whitespace-pre-line">
											<span className="font-medium text-purple-700 dark:text-purple-400">hdlm: </span>
											{appointment.notes}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
