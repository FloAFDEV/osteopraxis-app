import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment, Patient } from "@/types";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
	parseISO,
	addMonths,
	subMonths,
	isToday,
	startOfWeek,
	endOfWeek,
	isSameMonth,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MonthlyScheduleViewProps {
	appointments: Appointment[];
	patients: Patient[];
	selectedDate: Date;
	onDateChange: (date: Date) => void;
	onDayClick?: (date: Date) => void;
}

export function MonthlyScheduleView({
	appointments,
	patients,
	selectedDate,
	onDateChange,
	onDayClick,
}: MonthlyScheduleViewProps) {
	const navigate = useNavigate();
	const [currentMonth, setCurrentMonth] = useState(selectedDate);

	// Mémoriser la map des patients pour éviter les recherches répétées
	const patientMap = useMemo(() => {
		return new Map(patients.map((p) => [p.id, p]));
	}, [patients]);

	const getPatientById = useCallback(
		(patientId: number) => {
			return patientMap.get(patientId);
		},
		[patientMap],
	);

	// Prétraiter et grouper les rendez-vous par date pour éviter les filtres répétés
	const appointmentsByDate = useMemo(() => {
		const map = new Map<string, Appointment[]>();

		appointments.forEach((appointment) => {
			if (
				appointment.status === "SCHEDULED" ||
				appointment.status === "COMPLETED"
			) {
				try {
					const appointmentDate = parseISO(appointment.date);
					const dateKey = format(appointmentDate, "yyyy-MM-dd");

					if (!map.has(dateKey)) {
						map.set(dateKey, []);
					}
					map.get(dateKey)!.push(appointment);
				} catch (e) {
					// Ignorer les dates invalides
				}
			}
		});

		// Trier les rendez-vous pour chaque jour
		map.forEach((dayAppointments, dateKey) => {
			dayAppointments.sort((a, b) => {
				const timeA = parseISO(a.date);
				const timeB = parseISO(b.date);
				return timeA.getTime() - timeB.getTime();
			});
		});

		return map;
	}, [appointments]);

	const getDayAppointments = useCallback(
		(date: Date) => {
			const dateKey = format(date, "yyyy-MM-dd");
			return appointmentsByDate.get(dateKey) || [];
		},
		[appointmentsByDate],
	);

	const navigateToPreviousMonth = () => {
		const newMonth = subMonths(currentMonth, 1);
		setCurrentMonth(newMonth);
		onDateChange(newMonth);
	};

	const navigateToNextMonth = () => {
		const newMonth = addMonths(currentMonth, 1);
		setCurrentMonth(newMonth);
		onDateChange(newMonth);
	};

	const navigateToToday = () => {
		const today = new Date();
		setCurrentMonth(today);
		onDateChange(today);
	};

	// Mémoriser les jours du calendrier
	const { calendarDays, weeks } = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);
		const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
		const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
		const days = eachDayOfInterval({
			start: calendarStart,
			end: calendarEnd,
		});

		// Grouper par semaines
		const weeksArr = [];
		for (let i = 0; i < days.length; i += 7) {
			weeksArr.push(days.slice(i, i + 7));
		}

		return { calendarDays: days, weeks: weeksArr };
	}, [currentMonth]);

	const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

	return (
		<div className="space-y-4">
			{/* Navigation du mois */}
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					size="sm"
					onClick={navigateToPreviousMonth}
					className="flex items-center gap-2"
				>
					<ChevronLeft className="h-4 w-4" />
					Mois précédent
				</Button>

				<div className="flex items-center gap-4">
					<h2 className="text-xl font-semibold capitalize">
						{format(currentMonth, "MMMM yyyy", { locale: fr })}
					</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={navigateToToday}
					>
						Aujourd'hui
					</Button>
				</div>

				<Button
					variant="ghost"
					size="sm"
					onClick={navigateToNextMonth}
					className="flex items-center gap-2"
				>
					Mois suivant
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Calendrier mensuel */}
			<Card>
				<CardContent className="p-4">
					{/* En-têtes des jours de la semaine */}
					<div className="grid grid-cols-7 gap-2 mb-4">
						{weekDays.map((day) => (
							<div
								key={day}
								className="p-2 text-center text-sm font-medium text-muted-foreground"
							>
								{day}
							</div>
						))}
					</div>

					{/* Semaines */}
					<div className="space-y-2">
						{weeks.map((week, weekIndex) => (
							<div
								key={weekIndex}
								className="grid grid-cols-7 gap-2"
							>
								{week.map((day) => {
									const dayAppointments =
										getDayAppointments(day);
									const isCurrentMonth = isSameMonth(
										day,
										currentMonth,
									);
									const isDayToday = isToday(day);
									const hasAppointments =
										dayAppointments.length > 0;

									return (
										<div
											key={day.toISOString()}
											className={cn(
												// Hauteur responsive: plus grande sur grands écrans
												"min-h-[100px] lg:min-h-[140px] xl:min-h-[160px] 2xl:min-h-[200px]",
												"p-2 lg:p-3 xl:p-4 border rounded-lg transition-colors group cursor-pointer",
												isCurrentMonth
													? "bg-background hover:bg-muted/50"
													: "bg-muted/30 text-muted-foreground",
												isDayToday &&
													"ring-2 ring-primary",
											)}
											onClick={() => onDayClick?.(day)}
										>
											{/* Numéro du jour */}
											<div className="flex items-center justify-between mb-2">
												<span
													className={cn(
														"text-sm font-medium",
														isDayToday &&
															"text-primary font-bold",
													)}
												>
													{format(day, "d")}
												</span>
												{isCurrentMonth && (
													<div className="opacity-0 group-hover:opacity-100 transition-opacity">
														<Plus className="h-3 w-3 text-muted-foreground hover:text-foreground" />
													</div>
												)}
											</div>

											{/* Rendez-vous du jour */}
											<div className="space-y-0.5">
												{/* Afficher les 4 premiers rendez-vous */}
												{dayAppointments
													.slice(0, 4)
													.map((appointment) => {
														const patient =
															getPatientById(
																appointment.patientId,
															);
														const appointmentTime =
															format(
																parseISO(
																	appointment.date,
																),
																"HH:mm",
															);

														return (
															<div
																key={
																	appointment.id
																}
																className={cn(
																	"p-1.5 rounded-r transition-colors cursor-pointer",
																	"text-xs",
																	appointment.status ===
																		"COMPLETED"
																		? "bg-emerald-50 border-l-2 border-l-emerald-500 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
																		: "bg-slate-50 border-l-2 border-l-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800",
																)}
																onClick={(
																	e,
																) => {
																	e.stopPropagation();
																	navigate(
																		`/appointments/${appointment.id}/edit`,
																	);
																}}
															>
																<div className={cn(
																	"font-medium text-xs",
																	appointment.status === "COMPLETED"
																		? "text-emerald-700 dark:text-emerald-300"
																		: "text-slate-700 dark:text-slate-300"
																)}>
																	{appointmentTime}
																</div>
																<div className={cn(
																	"truncate text-xs",
																	appointment.status === "COMPLETED"
																		? "text-emerald-800 dark:text-emerald-200"
																		: "text-slate-800 dark:text-slate-200"
																)}>
																	{patient
																		? `${patient.firstName} ${patient.lastName}`
																		: `#${appointment.patientId}`}
																</div>
															</div>
														);
													})}

												{/* Indicateur s'il y a plus de rendez-vous */}
												{dayAppointments.length > 4 && (
													<div className="text-xs text-muted-foreground text-center">
														+{dayAppointments.length - 4}
													</div>
												)}

												{/* État vide pour les jours sans rendez-vous */}
												{dayAppointments.length === 0 &&
													isCurrentMonth && (
														<div className="text-center py-2 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
															Cliquer pour ajouter
														</div>
													)}
											</div>
										</div>
									);
								})}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Légende */}
			<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 bg-blue-100 border-l-2 border-l-blue-500 rounded"></div>
					<span>Rendez-vous planifié</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 bg-green-100 border-l-2 border-l-green-500 rounded"></div>
					<span>Rendez-vous terminé</span>
				</div>
			</div>
		</div>
	);
}
