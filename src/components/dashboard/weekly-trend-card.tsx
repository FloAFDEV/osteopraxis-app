import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardData } from "@/types";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { BlurredNumber } from "@/components/ui/blurred-amount";

interface WeeklyTrendCardProps {
	data: DashboardData;
}

const chartConfig = {
	consultations: {
		label: "Consultations",
		color: "hsl(var(--chart-1))",
	},
};

export function WeeklyTrendCard({ data }: WeeklyTrendCardProps) {
	// Calculate weekly trend percentage
	const currentWeekTotal = data.consultationsLast7Days.reduce(
		(sum, day) => sum + day.consultations,
		0
	);
	const weeklyAverage = currentWeekTotal / 7;

	// Determine trend color and icon based on weekly average vs daily average
	const trendColor =
		weeklyAverage > data.averageConsultationsPerDay
			? "text-green-500"
			: weeklyAverage < data.averageConsultationsPerDay
			? "text-red-500"
			: "text-gray-500";

	const TrendIcon =
		weeklyAverage > data.averageConsultationsPerDay
			? TrendingUp
			: weeklyAverage < data.averageConsultationsPerDay
			? TrendingDown
			: TrendingUp;

	const trendPercentage =
		data.averageConsultationsPerDay > 0
			? Math.round(
					((weeklyAverage - data.averageConsultationsPerDay) /
						data.averageConsultationsPerDay) *
						100
			  )
			: 0;

	return (
		<Card
			className={cn(
				"overflow-hidden rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-[2px]",
				"border-t-4 border-orange-500"
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle className="text-sm font-medium">
						Tendance 7 jours
					</CardTitle>
					<p className="text-xs text-muted-foreground mt-0.5">
						Évolution hebdomadaire
					</p>
				</div>
				<div className="h-7 w-7 font-medium text-orange-500">
					<Calendar />
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="text-2xl font-bold">{currentWeekTotal}</div>
					<div className="flex items-center gap-1 text-sm font-semibold">
						<TrendIcon className={cn("h-4 w-4", trendColor)} />
						<span className={trendColor}>
							{trendPercentage > 0 ? "+" : ""}
							{trendPercentage}%
						</span>
					</div>
				</div>

				<p className="text-xs text-orange-500">
					Moyenne: {weeklyAverage.toFixed(1)} consultations/jour
				</p>
			</CardContent>
		</Card>
	);
}
