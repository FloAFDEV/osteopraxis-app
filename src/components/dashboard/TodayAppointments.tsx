import { Appointment, Patient } from "@/types";
import { format, isToday, parseISO } from "date-fns";
import { Calendar, Clock } from "lucide-react";
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
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
							<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
						</div>
						<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Aujourd'hui
						</h2>
					</div>
					<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
						{count} séance{count > 1 ? "s" : ""}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-8 text-center">
						<Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Aucune séance aujourd'hui
						</p>
						<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
							Profitez de votre journée !
						</p>
					</div>
				) : (
					todayAppointments.slice(0, 6).map((apt, index) => {
						const patient = getPatient(apt.patientId);
						const time = format(parseISO(apt.date), "HH:mm");
						const isCompleted = apt.status === "COMPLETED";

						return (
							<Link
								key={apt.id}
								to={`/patients/${apt.patientId}`}
								className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
									index === 0 ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
								}`}
							>
								<span className="w-14 text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
									{time}
								</span>
								<span className={`flex-1 text-sm font-medium truncate ${
									isCompleted
										? "text-gray-500 dark:text-gray-400"
										: "text-gray-900 dark:text-gray-100"
								}`}>
									{patient
										? `${patient.lastName} ${patient.firstName}`
										: `Patient #${apt.patientId}`}
								</span>
								{isCompleted && (
									<span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
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
				<div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
					<Link
						to="/schedule"
						className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
					>
						+{count - 6} autre{count - 6 > 1 ? "s" : ""} séance{count - 6 > 1 ? "s" : ""}
					</Link>
				</div>
			)}
		</div>
	);
}
