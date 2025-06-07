
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { DashboardData } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, TrendingUp, UserPlus, Users, Stethoscope } from "lucide-react";

interface DashboardStatsProps {
	data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
	// Get current day and year for the appointments card
	const today = new Date();
	const formattedToday = format(today, "EEEE d MMMM yyyy", { locale: fr });

	// Display the real next appointment information
	let nextAppointmentText = "Aucune séance prévue";

	if (
		data &&
		data.nextAppointment &&
		data.nextAppointment !== "Aucune séance prévue"
	) {
		// Use the actual next appointment data from the API
		nextAppointmentText = `Prochaine: ${data.nextAppointment}`;
	}

	if (!data) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				{[1, 2, 3, 4, 5].map((item) => (
					<Card
						key={item}
						className="overflow-hidden shadow-sm border-t-4 border-t-blue-300"
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Chargement...
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="animate-pulse h-6 bg-blue-100 dark:bg-blue-800/30 rounded mb-2"></div>
							<div className="animate-pulse h-4 w-1/2 bg-blue-100 dark:bg-blue-800/30 rounded"></div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			<StatCard
				title="Patients totaux"
				value={data.totalPatients}
				description={
					data.thirtyDayGrowthPercentage > 0
						? `+${data.thirtyDayGrowthPercentage}% ce mois-ci`
						: `${data.thirtyDayGrowthPercentage}% ce mois-ci`
				}
				color={
					data.thirtyDayGrowthPercentage > 0
						? "text-blue-500"
						: "text-blue-500"
				}
				icon={<Users />}
			/>

			<StatCard
				title="Nouveaux patients (mois)"
				value={data.newPatientsThisMonth}
				description={`+${data.newPatientsLast30Days} ces 30 derniers jours`}
				color="text-purple-500"
				icon={<UserPlus />}
			/>

			<StatCard
				title="Consultations ce mois"
				value={data.consultationsThisMonth}
				description={
					data.consultationsTrend > 0
						? `+${data.consultationsTrend}% vs mois dernier`
						: data.consultationsTrend < 0
						? `${data.consultationsTrend}% vs mois dernier`
						: `${data.averageConsultationsPerDay} consultations/jour`
				}
				color="text-indigo-500"
				icon={<Stethoscope />}
			/>

			<StatCard
				title="Séance aujourd'hui"
				subtitle={formattedToday}
				value={data.appointmentsToday}
				description={nextAppointmentText}
				color="text-green-500"
				icon={<Calendar />}
			/>

			<StatCard
				title="Croissance annuelle"
				value={`${data.annualGrowthPercentage}%`}
				description={`${data.newPatientsThisYear} nouveaux patients cette année`}
				color="text-amber-500"
				icon={<TrendingUp />}
			/>
		</div>
	);
}
