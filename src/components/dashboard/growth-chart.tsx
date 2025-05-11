import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData } from "@/types";
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

interface GrowthChartProps {
	data: DashboardData;
}

export function GrowthChart({ data }: GrowthChartProps) {
	const { isMobile } = useIsMobile();

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

	// Enhance monthly growth data with gender-specific and children data
	const formattedData = data.monthlyGrowth.map((item) => {
		// Generate sample counts for men, women, and children based on the total
		// In a real app, these would come from the real database counts
		const total = item.patients || 0;
		const malePercentage = Math.random() * 0.5 + 0.3; // 30-80%
		const maleCount = Math.round(total * malePercentage);

		const childPercentage = Math.random() * 0.3; // 0-30%
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

	return (
		<div className="w-full h-[400px]">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={formattedData}
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
					<Line
						type="monotone"
						dataKey="total"
						stroke="#9b87f5"
						strokeWidth={3}
						dot={{ stroke: "#9b87f5", strokeWidth: 2, r: 4 }}
						activeDot={{ r: 6 }}
						name="total"
					/>
					<Line
						type="monotone"
						dataKey="hommes"
						stroke="#60a5fa"
						strokeWidth={2}
						dot={{ stroke: "#D3E4FD", strokeWidth: 2, r: 3 }}
						activeDot={{ r: 5 }}
						name="hommes"
					/>
					<Line
						type="monotone"
						dataKey="femmes"
						stroke="#b93dcc"
						strokeWidth={2}
						dot={{ stroke: "#FFDEE2", strokeWidth: 2, r: 3 }}
						activeDot={{ r: 5 }}
						name="femmes"
					/>
					<Line
						type="monotone"
						dataKey="enfants"
						stroke="#34d399"
						strokeWidth={2}
						dot={{ stroke: "#E5DEFF", strokeWidth: 2, r: 3 }}
						activeDot={{ r: 5 }}
						name="enfants"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
