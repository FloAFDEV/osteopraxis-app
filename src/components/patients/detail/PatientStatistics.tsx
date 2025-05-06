
import { PatientStat } from "@/components/ui/patient-stat";
import { Appointment, Patient } from "@/types";
import { Calendar, ClipboardList, History, Stethoscope } from "lucide-react";
import { format } from "date-fns";

interface PatientStatisticsProps {
	patient: Patient;
	appointments: Appointment[];
	upcomingAppointments: Appointment[];
	pastAppointments: Appointment[];
}

export function PatientStatistics({ 
	patient, 
	appointments,
	upcomingAppointments,
	pastAppointments 
}: PatientStatisticsProps) {
	return (
		<div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				<PatientStat
					title="Total séances"
					value={appointments.length}
					icon={<Calendar className="h-5 w-5" />}
					colorClass="text-blue-500"
				/>
				<PatientStat
					title="Séances à venir"
					value={upcomingAppointments.length}
					icon={<ClipboardList className="h-5 w-5" />}
					colorClass="text-purple-500"
				/>
				<PatientStat
					title="En cours de traitement"
					value={patient.currentTreatment ? "Oui" : "Non"}
					icon={<Stethoscope className="h-5 w-5" />}
					colorClass="text-emerald-500"
				/>
				<PatientStat
					title="Dernière Séance"
					value={
						pastAppointments[0]
							? format(
									new Date(pastAppointments[0].date),
									"dd/MM/yyyy"
							  )
							: "Aucune"
					}
					icon={<History className="h-5 w-5" />}
					colorClass="text-amber-500"
				/>
			</div>
		</div>
	);
}
