import { Appointment, Patient } from "@/types";
import { format, isToday, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface TodayAppointmentsProps {
	appointments: Appointment[];
	patients: Patient[];
}

export function TodayAppointments({ appointments, patients }: TodayAppointmentsProps) {
	const getPatient = (patientId: number | string) => {
		return patients.find((p) => p.id === patientId);
	};

	const todayAppointments = appointments
		.filter((apt) => {
			const date = parseISO(apt.date);
			return isToday(date) && (apt.status === "SCHEDULED" || apt.status === "COMPLETED");
		})
		.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

	const count = todayAppointments.length;

	return (
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
			{/* Header */}
			<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						Aujourd'hui
					</h2>
					<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
						{count} séance{count > 1 ? "s" : ""}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-6 text-center">
						<Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Aucune séance aujourd'hui
						</p>
					</div>
				) : (
					todayAppointments.slice(0, 6).map((apt) => {
						const patient = getPatient(apt.patientId);
						const time = format(parseISO(apt.date), "HH:mm");

						return (
							<Link
								key={apt.id}
								to={`/patients/${apt.patientId}`}
								className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<span className="w-12 text-sm font-mono text-gray-500 dark:text-gray-400">
									{time}
								</span>
								<span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
									{patient
										? `${patient.lastName} ${patient.firstName}`
										: `Patient #${apt.patientId}`}
								</span>
								{apt.status === "COMPLETED" && (
									<span className="text-xs text-amber-600 dark:text-amber-400">
										Terminé
									</span>
								)}
							</Link>
						);
					})
				)}
			</div>

			{/* Footer */}
			{count > 6 && (
				<div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
					<Link
						to="/schedule"
						className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
					>
						+{count - 6} autres
					</Link>
				</div>
			)}
		</div>
	);
}
