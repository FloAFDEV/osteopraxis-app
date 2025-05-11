
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData, Patient } from "@/types";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useEffect, useState } from "react";

interface GrowthChartProps {
	data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
	const { isMobile } = useIsMobile();
	const [chartData, setChartData] = useState<any[]>([]);

	useEffect(() => {
		if (!data || !data.monthlyGrowth) return;

		// Traduction des mois
		const monthMap: Record<string, string> = {
			January: "Janvier",
			February: "Février",
			March: "Mars",
			April: "Avril",
			May: "Mai",
			June: "Juin",
			July: "Juillet",
			August: "Août",
			September: "Septembre",
			October: "Octobre",
			November: "Novembre",
			December: "Décembre",
		};

		// Formater les données
		const formattedData = data.monthlyGrowth.map((item) => {
			const total = item.patients || 0;
			
			// Obtention des valeurs réelles à partir des données du dashboard
			const malePercentage = data.totalPatients > 0 ? data.maleCount / data.totalPatients : 0.4;
			const childPercentage = data.totalPatients > 0 ? data.childrenCount / data.totalPatients : 0.2;
			
			// Calcul des proportions basé sur les pourcentages réels
			const maleCount = Math.round(total * malePercentage);
			const childCount = Math.round(total * childPercentage);
			const femaleCount = total - maleCount - childCount;

			return {
				month: monthMap[item.month] || item.month,
				total: total,
				hommes: maleCount,
				femmes: femaleCount,
				enfants: childCount,
				growthText: item.growthText,
			};
		});

		// Vérifier si les données contiennent des valeurs non nulles
		console.log("Données du graphique:", formattedData);
		
		setChartData(formattedData);
	}, [data]);

	if (!data || !data.monthlyGrowth) {
		return (
			<Card className="overflow-hidden rounded-lg border-t-4 border-t-gray-300 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-2 shadow-lg">
				<CardHeader>
					<CardTitle>Croissance mensuelle</CardTitle>
				</CardHeader>
				<CardContent className="h-[300px] flex items-center justify-center">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="w-full">
			<div className="w-full h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{
							top: 5,
							right: 10,
							bottom: 5,
							left: isMobile ? 0 : 30,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
						<XAxis
							dataKey="month"
							tick={{ fill: "#64748b", fontSize: 16 }}
						/>
						<YAxis
							tick={{ fill: "#64748b", fontSize: 16 }}
							domain={[0, "auto"]}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#0891b2",
								border: "none",
								borderRadius: "8px",
								boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
							}}
							itemStyle={{ color: "#ffffff", fontSize: "14px" }}
							labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
							formatter={(value, name) => {
								// Format the names to display in French
								const nameMap: Record<string, string> = {
									total: "Total",
									hommes: "Hommes",
									femmes: "Femmes",
									enfants: "Enfants",
								};

								return [`${value} patients`, nameMap[name] || name];
							}}
						/>
						<Legend
							verticalAlign="bottom"
							height={36}
							iconType="circle"
							formatter={(value) => {
								const nameMap: Record<string, string> = {
									total: "Total",
									hommes: "Hommes",
									femmes: "Femmes",
									enfants: "Enfants",
								};
								return nameMap[value] || value;
							}}
						/>
						{/* Lignes pour chaque série de données */}
						<Line
							type="monotone"
							dataKey="total"
							stroke="#9b87f5"
							strokeWidth={3}
							dot={{ stroke: "#9b87f5", strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6 }}
							name="total"
							isAnimationActive={true}
							animationDuration={1200}
							connectNulls={true}
						/>
						<Line
							type="monotone"
							dataKey="hommes"
							stroke="#60a5fa"
							strokeWidth={2}
							dot={{ stroke: "#60a5fa", strokeWidth: 2, r: 3 }}
							activeDot={{ r: 5 }}
							name="hommes"
							isAnimationActive={true}
							animationDuration={1500}
							connectNulls={true}
						/>
						<Line
							type="monotone"
							dataKey="femmes"
							stroke="#b93dcc"
							strokeWidth={2}
							dot={{ stroke: "#b93dcc", strokeWidth: 2, r: 3 }}
							activeDot={{ r: 5 }}
							name="femmes"
							isAnimationActive={true}
							animationDuration={1800}
							connectNulls={true}
						/>
						<Line
							type="monotone"
							dataKey="enfants"
							stroke="#34d399"
							strokeWidth={2}
							dot={{ stroke: "#34d399", strokeWidth: 2, r: 3 }}
							activeDot={{ r: 5 }}
							name="enfants"
							isAnimationActive={true}
							animationDuration={2100}
							connectNulls={true}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
