import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { DashboardData } from "@/types";
import { Stethoscope, TrendingDown, TrendingUp } from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

interface ConsultationsChartProps {
	data: DashboardData;
}

const chartConfig = {
	consultations: {
		label: "Consultations",
		color: "hsl(var(--chart-1))",
	},
};

export function ConsultationsChart({ data }: ConsultationsChartProps) {
	// Determine trend color and icon
	const trendColor =
		data.consultationsTrend > 0
			? "text-green-500"
			: data.consultationsTrend < 0
			? "text-red-500"
			: "text-gray-500";

	const TrendIcon =
		data.consultationsTrend > 0
			? TrendingUp
			: data.consultationsTrend < 0
			? TrendingDown
			: TrendingUp;

	return (
		<div className="space-y-6">
				{/* Graphique principal - 12 derniers mois */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between w-full">
						<h4 className="text-sm font-medium text-muted-foreground">
							12 derniers mois
						</h4>
						<div className="flex items-center gap-1 text-sm font-semibold">
							<TrendIcon className={cn("h-4 w-4", trendColor)} />
							<span className={trendColor}>
								{data.consultationsTrend > 0 ? "+" : ""}
								{data.consultationsTrend}%
							</span>
						</div>
					</div>

					<ChartContainer config={chartConfig} className="h-[225px]">
						<AreaChart data={data.consultationsLast12Months} width={598} height={225}>
								<defs>
									<linearGradient
										id="consultationsGradient"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="rgb(99, 102, 241)"
											stopOpacity={0.3}
										/>
										<stop
											offset="95%"
											stopColor="rgb(99, 102, 241)"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tick={{
										fontSize: 12,
										fill: "hsl(var(--muted-foreground))",
									}}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{
										fontSize: 12,
										fill: "hsl(var(--muted-foreground))",
									}}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent indicator="line" />
									}
									cursor={{
										stroke: "hsl(var(--border))",
										strokeWidth: 1,
									}}
								/>
								<Area
									type="monotone"
									dataKey="consultations"
									stroke="rgb(99, 102, 241)"
									strokeWidth={2}
									fill="url(#consultationsGradient)"
								/>
							</AreaChart>
					</ChartContainer>
				</div>

				{/* Graphique secondaire - 7 derniers jours */}
				<div>
					<h4 className="text-sm font-medium text-muted-foreground mb-3">
						7 derniers jours
					</h4>
					<ChartContainer config={chartConfig} className="h-[225px]">
						<BarChart data={data.consultationsLast7Days} width={598} height={225}>
								<XAxis
									dataKey="day"
									axisLine={false}
									tickLine={false}
									tick={{
										fontSize: 12,
										fill: "hsl(var(--muted-foreground))",
									}}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{
										fontSize: 12,
										fill: "hsl(var(--muted-foreground))",
									}}
								/>
								<ChartTooltip
									content={<ChartTooltipContent />}
									cursor={{ fill: "hsl(var(--muted) / 0.1)" }}
								/>
								<Bar
									dataKey="consultations"
									fill="rgb(99, 102, 241)"
									radius={[2, 2, 0, 0]}
								/>
							</BarChart>
					</ChartContainer>
				</div>

				{/* Métriques résumées */}
				<div className="grid grid-cols-2 gap-4 pt-2 border-t">
					<div className="text-center">
						<p className="text-2xl font-bold text-indigo-500">
							{data.averageConsultationsPerDay}
						</p>
						<p className="text-xs text-foreground">
							Consultations/jour
						</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-indigo-500">
							{data.averageConsultationsPerMonth}
						</p>
						<p className="text-xs text-foreground">
							Consultations/mois
						</p>
					</div>
				</div>
		</div>
	);
}
