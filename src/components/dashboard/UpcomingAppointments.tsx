import { Appointment, Patient } from "@/types";
import { format, isToday, parseISO, isTomorrow, addDays, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface UpcomingAppointmentsProps {
	appointments: Appointment[];
	patients: Patient[];
}

export function UpcomingAppointments({ appointments, patients }: UpcomingAppointmentsProps) {
	const getPatient = (patientId: number | string) => {
		return patients.find((p) => p.id === patientId);
	};

	const now = new Date();
	const nextWeek = addDays(now, 7);

	// Filtrer les RDV à venir (pas aujourd'hui, dans les 7 prochains jours)
	const upcomingAppointments = appointments
		.filter((apt) => {
			const date = parseISO(apt.date);
			return (
				!isToday(date) &&
				date > now &&
				isBefore(date, nextWeek) &&
				apt.status === "SCHEDULED"
			);
		})
		.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

	const count = upcomingAppointments.length;

	const formatDayLabel = (dateStr: string) => {
		const date = parseISO(dateStr);
		if (isTomorrow(date)) {
			return "Demain";
		}
		return format(date, "EEE d", { locale: fr });
	};

	return (
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
			{/* Header */}
			<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						À venir
					</h2>
					<span className="text-xs text-gray-500 dark:text-gray-400">
						7 prochains jours
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-6 text-center">
						<CalendarDays className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Aucune séance prévue
						</p>
					</div>
				) : (
					upcomingAppointments.slice(0, 5).map((apt) => {
						const patient = getPatient(apt.patientId);
						const time = format(parseISO(apt.date), "HH:mm");
						const dayLabel = formatDayLabel(apt.date);

						return (
							<Link
								key={apt.id}
								to={`/patients/${apt.patientId}`}
								className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<span className="w-16 text-xs text-gray-500 dark:text-gray-400">
									{dayLabel}
								</span>
								<span className="w-12 text-sm font-mono text-gray-500 dark:text-gray-400">
									{time}
								</span>
								<span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
									{patient
										? `${patient.lastName} ${patient.firstName}`
										: `Patient #${apt.patientId}`}
								</span>
							</Link>
						);
					})
				)}
			</div>

			{/* Footer */}
			<div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
				<Link
					to="/schedule"
					className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					<span>Voir le planning</span>
					<ChevronRight className="h-4 w-4" />
				</Link>
			</div>
		</div>
	);
}
